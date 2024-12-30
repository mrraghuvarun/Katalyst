import logging
from azure.storage.blob import BlobServiceClient
import pandas as pd
from io import BytesIO
import snowflake.connector
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Processing request to upload file data to Snowflake")

    # Extract parameters from request
    container_name = req.params.get('blobContainer')
    blob_name = req.params.get('blobName')
    database = req.params.get('databaseName')
    table = req.params.get('tableName')

    if not container_name or not blob_name or not database or not table:
        return func.HttpResponse(
            "Missing required query parameters: blobContainer, blobName, databaseName, tableName.",
            status_code=400
        )

    try:
        # Blob Storage connection
        AZURE_CONNECTION_STRING = (
            "DefaultEndpointsProtocol=https;AccountName=mifiddatainjection;"
            "AccountKey=gd9qexRaHJNcAC+DMxhUj5qT+9Guzx1CiWGRndLz5ezi2bdGGM8uXov5DDNcgt1WCpcKKoD/kYVZ+ASt8kwWAQ==;"
            "EndpointSuffix=core.windows.net"
        )
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        blob_data = blob_client.download_blob().readall()
        logging.info("File downloaded from Blob Storage successfully")

        # Parse Excel file
        data = pd.read_excel(BytesIO(blob_data))
        if data.empty:
            return func.HttpResponse("Uploaded file is empty.", status_code=400)

        logging.info("File parsed into DataFrame")

        # Snowflake connection
        SNOWFLAKE_USER = "Raghu"
        SNOWFLAKE_PASSWORD = "Katalyst@123"
        SNOWFLAKE_ACCOUNT = "dc03591.north-europe"  # Example: abcd123.us-east-1

        conn = snowflake.connector.connect(
            user=SNOWFLAKE_USER,
            password=SNOWFLAKE_PASSWORD,
            account=SNOWFLAKE_ACCOUNT
        )
        cursor = conn.cursor()

        # Ensure the database exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database};")
        cursor.execute(f"USE DATABASE {database};")
        logging.info(f"Database {database} ensured to exist and set for use")

        # Ensure the table exists
        columns = data.columns
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table} (
            {', '.join([f'{col} STRING' for col in columns])}
        );
        """
        cursor.execute(create_table_query)
        logging.info(f"Table {table} ensured to exist in database {database}")

        # Insert data into Snowflake table
        insert_query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(['%s'] * len(columns))});"

        for row in data.itertuples(index=False, name=None):
            values = tuple(row)  # Convert row to tuple
            cursor.execute(insert_query, values)

        conn.commit()
        logging.info("Data inserted into Snowflake successfully")

        cursor.close()
        conn.close()

        return func.HttpResponse(
            f"File processed successfully and data inserted into table {table}.", status_code=200
        )
    except Exception as e:
        logging.error(f"Error processing file: {e}")
        return func.HttpResponse(f"Error processing file: {e}", status_code=500)
