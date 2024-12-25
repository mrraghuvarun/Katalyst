import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { CheckCircle } from "lucide-react"; // For success icon

const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-center bg-white max-w-[90%] sm:max-w-[400px] rounded-lg p-6">
        <DialogHeader>
          <div className="flex justify-center items-center mb-4">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Upload Successful!
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 text-sm mb-6">
          Your file has been uploaded successfully.
        </p>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
