import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OtConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  // Summary info to display in description
  userLabel: string;
  dateFrom: string;
  dateTo: string;
  overtime: string;
  selectedCount: number;
}

export function OtConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  userLabel,
  dateFrom,
  dateTo,
  overtime,
  selectedCount,
}: OtConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const overtimeDisplay =
    parseFloat(overtime) === 1
      ? "1 HR"
      : overtime
      ? `${overtime} HRS`
      : overtime;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold">
            Confirm Overtime Update
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You are about to apply overtime to{" "}
                <span className="font-medium text-foreground">
                  {selectedCount} attendance record{selectedCount !== 1 ? "s" : ""}
                </span>{" "}
                for:
              </p>
              <div className="rounded-md border bg-muted/40 px-3 py-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee</span>
                  <span className="font-medium text-foreground text-right max-w-[60%] truncate">
                    {userLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Range</span>
                  <span className="font-medium text-foreground">
                    {dateFrom} – {dateTo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overtime</span>
                  <span className="font-medium text-foreground">
                    {overtimeDisplay}
                  </span>
                </div>
              </div>
              <p>This action cannot be undone. Do you want to continue?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                Updating...
              </span>
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}