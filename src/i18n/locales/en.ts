const en = {
  // App
  appName: "QPDF GUI",

  // Sidebar
  nav: {
    dashboard: "Dashboard",
    extract: "Extract",
    merge: "Merge",
    split: "Split",
    rotate: "Rotate",
    delete: "Delete",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    optimize: "Optimize",
    linearize: "Linearize",
    info: "Info",
    batch: "Batch",
    settings: "Settings",
  },

  // Header
  page: {
    dashboard: "Dashboard",
    extractPages: "Extract Pages",
    mergePdfs: "Merge PDFs",
    splitPdf: "Split PDF",
    rotatePages: "Rotate Pages",
    deletePages: "Delete Pages",
    encryptPdf: "Encrypt PDF",
    decryptPdf: "Decrypt PDF",
    optimizePdf: "Optimize PDF",
    linearizePdf: "Linearize PDF",
    pdfInfo: "PDF Info",
    batchOps: "Batch Operations",
    settings: "Settings",
  },

  // Theme
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  // Shared
  shared: {
    dropSingle: "Drop PDF file here",
    dropMultiple: "Drop PDF files here",
    browse: "Browse files",
    processing: "Processing...",
    operationLog: "Operation Log",
    clear: "Clear",
    remove: "Remove",
    pages: "pages",
    page: "page",
    filesSelected: "files selected",
    fileSelected: "file selected",
    chooseOutputFolder: "Choose output folder",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    subtitle: "Select a tool or drop a PDF to get started",
    chooseToolFor: "Choose a tool for:",
    recentFiles: "Recent Files",
    clearAll: "Clear all",
    tools: {
      info: { label: "PDF Info", desc: "View file properties" },
      extract: { label: "Extract Pages", desc: "Pull pages from a PDF" },
      merge: { label: "Merge PDFs", desc: "Combine multiple PDFs" },
      split: { label: "Split PDF", desc: "Split into parts" },
      rotate: { label: "Rotate Pages", desc: "Rotate page orientation" },
      delete: { label: "Delete Pages", desc: "Remove pages" },
      encrypt: { label: "Encrypt", desc: "Add password protection" },
      decrypt: { label: "Decrypt", desc: "Remove password" },
      optimize: { label: "Optimize", desc: "Reduce file size" },
      linearize: { label: "Linearize", desc: "Fast web viewing" },
      batch: { label: "Batch Ops", desc: "Process multiple files" },
    },
  },

  // Extract
  extract: {
    title: "Extract Pages",
    subtitle: "Extract specific pages from a PDF into a new file",
    placeholder: "Pages (e.g. 1-5,8,10-12)",
    btnIdle: "Save Extracted Pages",
    btnLoading: "Extracting...",
    loading: "Extracting pages...",
    errorNoFile: "Select a file and enter page range",
    errorInvalid: "Invalid page range format (e.g. 1-5,8,10-12)",
  },

  // Merge
  merge: {
    title: "Merge PDFs",
    subtitle: "Combine multiple PDF files into one",
    btnIdle: "Save Merged File",
    btnLoading: "Merging...",
    loading: "Merging files...",
    errorMin: "Select at least 2 PDF files",
  },

  // Split
  split: {
    title: "Split PDF",
    subtitle: "Split a PDF into separate files",
    byRanges: "By Page Ranges",
    everyN: "Every N Pages",
    every: "Every",
    intervalError: "Interval must be at least 1",
    rangeError: "Enter page range",
    btnIdle: "Split PDF",
    btnLoading: "Splitting...",
    loading: "Splitting file...",
    errorFile: "Select a PDF file",
    errorInvalid: "Invalid page range format (e.g. 1-5,8,10-12)",
  },

  // Rotate
  rotate: {
    title: "Rotate Pages",
    subtitle: "Rotate pages in a PDF by 90°, 180°, or 270°",
    placeholder: "Pages (leave blank for all)",
    btnIdle: "Save Rotated File",
    btnLoading: "Rotating...",
    loading: "Rotating pages...",
    errorFile: "Select a PDF file",
    errorInvalid: "Invalid page range format (e.g. 1-5,8,10-12)",
  },

  // Delete
  delete: {
    title: "Delete Pages",
    subtitle: "Remove specific pages from a PDF",
    placeholder: "Pages to delete (e.g. 1,3,5-7)",
    btnIdle: "Save Without Pages",
    btnLoading: "Deleting...",
    loading: "Deleting pages...",
    errorNoFile: "Select a file and enter pages",
    errorInvalid: "Invalid page range format (e.g. 1,3,5-7)",
  },

  // Encrypt
  encrypt: {
    title: "Encrypt PDF",
    subtitle: "Add password protection to PDF files",
    password: "Password",
    confirmPassword: "Confirm password",
    btnIdle: "Encrypt Files",
    btnLoading: "Encrypting...",
    loading: "Encrypting PDFs...",
    errorNoFiles: "Select PDF files",
    errorNoPassword: "Enter a password",
    errorMismatch: "Passwords don't match",
  },

  // Decrypt
  decrypt: {
    title: "Decrypt PDF",
    subtitle: "Remove password protection from PDF files",
    enterPassword: "Enter password",
    btnIdle: "Decrypt Files",
    btnLoading: "Decrypting...",
    loading: "Decrypting PDFs...",
    errorNoFiles: "Select PDF files",
    errorNoPassword: "Enter a password",
  },

  // Optimize
  optimize: {
    title: "Optimize PDF",
    subtitle: "Reduce PDF file size with quality presets",
    generalized: "Generalized",
    generalizedDesc: "Balanced compression (default)",
    all: "All",
    allDesc: "Maximum compression",
    specialized: "Specialized",
    specializedDesc: "Minimal changes",
    none: "None",
    noneDesc: "No recompression",
    btnIdle: "Save Optimized File",
    btnLoading: "Optimizing...",
    loading: "Optimizing PDF...",
    errorFile: "Select a PDF file",
  },

  // Linearize
  linearize: {
    title: "Linearize PDF",
    subtitle: "Optimize for fast web viewing with progressive rendering",
    btnIdle: "Save Linearized File",
    btnLoading: "Linearizing...",
    loading: "Linearizing PDF...",
    errorFile: "Select a PDF file",
  },

  // Info
  info: {
    title: "PDF Info",
    subtitle: "View metadata and properties of a PDF file",
    loading: "Reading PDF info...",
    loaded: "PDF info loaded",
    pages: "Pages",
    file: "File",
    size: "Size",
    title_: "Title",
    author: "Author",
    creator: "Creator",
    producer: "Producer",
    created: "Created",
    encrypted: "Encrypted",
    yes: "Yes",
    no: "No",
    empty: "Drop a PDF to view its properties",
  },

  // Batch
  batch: {
    title: "Batch Operations",
    subtitle: "Apply an operation to all PDFs in a folder",
    inputDir: "Input Directory",
    outputDir: "Output Directory",
    operation: "Operation",
    optimize: "Optimize",
    linearize: "Linearize",
    btnIdle: "Run Batch Operation",
    btnLoading: "Running...",
    loading: "Running batch operation...",
    errorNoInput: "Select input directory",
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Configure application preferences",
    appearance: "Appearance",
    theme: "Theme",
    general: "General",
    overwrite: "Overwrite existing files",
    rememberRecent: "Remember recent files",
    maxRecent: "Max recent files:",
    defaultOutput: "Default Output Directory",
    defaultOutputPlaceholder: "Same as input file",
    defaultOutputHint: "Leave empty to save in the same directory as the input file",
    language: "Language",
    developer: {
      name: "Mostafa Mohamed",
      credit: "Made with love in Egypt 🇪🇬",
      telegram: "💬 Telegram",
    },
  },

  // Validation
  validation: {
    required: "This field is required",
  },
}

export default en
export type TranslationKeys = typeof en
