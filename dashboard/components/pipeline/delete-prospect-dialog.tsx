"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { usePipelineStoreWithSupabase } from "@/stores/usePipelineStoreWithSupabase"
import { IProspect } from "@/types"
import { Loader2, Trash2 } from "lucide-react"

interface DeleteProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: IProspect | null
}

export function DeleteProspectDialog({
  open,
  onOpenChange,
  prospect
}: DeleteProspectDialogProps) {
  const { deleteProspect } = usePipelineStoreWithSupabase()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!prospect) return

    setIsDeleting(true)
    try {
      await deleteProspect(prospect.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting prospect:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Prospect</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>{prospect?.business.name}</strong>? This action cannot be
            undone and will permanently remove the prospect from your pipeline.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Prospect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}