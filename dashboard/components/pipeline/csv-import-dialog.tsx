"use client"

import * as React from "react"
import Papa from "papaparse"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePipelineStoreWithSupabase } from "@/stores/usePipelineStoreWithSupabase"
import {
  mapCsvHeaders,
  validateCsvBatch,
  generateCsvTemplate,
  csvRowToDbFormat,
  CsvValidationResult,
} from "@/lib/validations/csv-prospect"
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
  FileUp,
} from "lucide-react"

interface CsvImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImportState {
  file: File | null
  parsing: boolean
  validating: boolean
  importing: boolean
  headers: string[]
  mappedFields: Record<string, string>
  rawData: any[]
  validationResult: CsvValidationResult | null
  importResult: {
    imported: number
    failed: number
    skipped: number
  } | null
  error: string | null
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const { importProspects, prospects } = usePipelineStoreWithSupabase()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [state, setState] = React.useState<ImportState>({
    file: null,
    parsing: false,
    validating: false,
    importing: false,
    headers: [],
    mappedFields: {},
    rawData: [],
    validationResult: null,
    importResult: null,
    error: null,
  })

  const resetState = () => {
    setState({
      file: null,
      parsing: false,
      validating: false,
      importing: false,
      headers: [],
      mappedFields: {},
      rawData: [],
      validationResult: null,
      importResult: null,
      error: null,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      setState(prev => ({ ...prev, error: "Please select a CSV file" }))
      return
    }

    setState(prev => ({
      ...prev,
      file,
      error: null,
      validationResult: null,
      importResult: null,
    }))

    parseAndValidateFile(file)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]

    if (!file) return

    if (!file.name.endsWith(".csv")) {
      setState(prev => ({ ...prev, error: "Please drop a CSV file" }))
      return
    }

    setState(prev => ({
      ...prev,
      file,
      error: null,
      validationResult: null,
      importResult: null,
    }))

    parseAndValidateFile(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const parseAndValidateFile = (file: File) => {
    setState(prev => ({ ...prev, parsing: true }))

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          setState(prev => ({
            ...prev,
            parsing: false,
            error: `Parse error: ${result.errors[0].message}`,
          }))
          return
        }

        const headers = result.meta.fields || []
        const mappedFields = mapCsvHeaders(headers)
        const rawData = result.data

        // Map raw data to expected field names
        const mappedData = rawData.map(row => {
          const mapped: any = {}
          Object.entries(mappedFields).forEach(([csvHeader, dbField]) => {
            mapped[dbField] = row[csvHeader] || ""
          })
          return mapped
        })

        setState(prev => ({
          ...prev,
          parsing: false,
          validating: true,
          headers,
          mappedFields,
          rawData,
        }))

        // Validate the mapped data
        const existingNames = new Set(
          prospects.map(p => p.business.name.toLowerCase())
        )

        const validationResult = validateCsvBatch(mappedData, existingNames)

        setState(prev => ({
          ...prev,
          validating: false,
          validationResult,
        }))
      },
      error: (error) => {
        setState(prev => ({
          ...prev,
          parsing: false,
          error: `Parse error: ${error.message}`,
        }))
      },
    })
  }

  const handleImport = async () => {
    if (!state.validationResult) return

    setState(prev => ({ ...prev, importing: true, error: null }))

    try {
      // Convert validated rows to database format
      const prospectsToImport = state.validationResult.valid.map(csvRowToDbFormat)

      // Call the import function from store
      const result = await importProspects(prospectsToImport)

      setState(prev => ({
        ...prev,
        importing: false,
        importResult: {
          imported: result.imported,
          failed: result.failed,
          skipped: state.validationResult!.duplicates.length,
        },
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        importing: false,
        error: error instanceof Error ? error.message : "Import failed",
      }))
    }
  }

  const downloadTemplate = () => {
    const csvContent = generateCsvTemplate()
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prospect_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderContent = () => {
    // Import completed
    if (state.importResult) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Import Complete!</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {state.importResult.imported}
              </div>
              <div className="text-sm text-green-600">Imported</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {state.importResult.skipped}
              </div>
              <div className="text-sm text-yellow-600">Skipped</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {state.importResult.failed}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              resetState()
              onOpenChange(false)
            }}>
              Done
            </Button>
          </DialogFooter>
        </div>
      )
    }

    // Validation results
    if (state.validationResult) {
      const total = state.rawData.length
      const valid = state.validationResult.valid.length
      const invalid = state.validationResult.invalid.length
      const duplicates = state.validationResult.duplicates.length

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {state.file?.name}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded bg-muted">
              <div className="text-lg font-semibold">{total}</div>
              <div className="text-xs text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center p-2 rounded bg-green-50">
              <div className="text-lg font-semibold text-green-600">{valid}</div>
              <div className="text-xs text-green-600">Valid</div>
            </div>
            <div className="text-center p-2 rounded bg-yellow-50">
              <div className="text-lg font-semibold text-yellow-600">{duplicates}</div>
              <div className="text-xs text-yellow-600">Duplicates</div>
            </div>
            <div className="text-center p-2 rounded bg-red-50">
              <div className="text-lg font-semibold text-red-600">{invalid}</div>
              <div className="text-xs text-red-600">Invalid</div>
            </div>
          </div>

          {state.validationResult.invalid.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-32 mt-2">
                  {state.validationResult.invalid.map((item, idx) => (
                    <div key={idx} className="text-sm mb-2">
                      <strong>Row {item.row}:</strong>
                      <ul className="ml-4 list-disc">
                        {item.errors.map((error, errIdx) => (
                          <li key={errIdx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {state.validationResult.duplicates.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Duplicate Businesses</AlertTitle>
              <AlertDescription>
                {state.validationResult.duplicates.length} rows contain businesses that already exist in the database and will be skipped.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetState}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={state.validationResult.valid.length === 0 || state.importing}
            >
              {state.importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {valid} Prospects
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      )
    }

    // File selection
    return (
      <div className="space-y-4">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {state.parsing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Parsing CSV file...</p>
            </div>
          ) : (
            <>
              <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drop your CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Only .csv files are supported</p>
            </>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="link"
            onClick={downloadTemplate}
            className="text-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>

        {state.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>CSV Format</AlertTitle>
          <AlertDescription>
            Your CSV should include columns for: Business Name (required), Industry (required), Location (required), Contact Name, Email, Phone, Website, Temperature, Stage, Score, and Notes.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetState()
      }
      onOpenChange(isOpen)
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Prospects from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import prospects into your pipeline
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}