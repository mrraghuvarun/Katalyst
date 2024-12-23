import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { CheckCircle } from "lucide-react"; // For success icon

const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <div className="flex justify-center items-center mb-4">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <DialogTitle>Upload Successful!</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">Your file has been uploaded successfully.</p>
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
