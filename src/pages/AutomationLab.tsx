import { useState, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  CheckSquare, 
  Circle, 
  ChevronDown, 
  Info, 
  GripVertical,
  Upload,
  AlertTriangle,
  X,
  ExternalLink,
  Loader2,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Table as TableIcon,
  ScrollText,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

// Sample data for autocomplete
const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Spain',
  'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Poland'
];

// Sample table data
const tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive' },
];

const AutomationLab = () => {
  // Checkbox state
  const [checkboxes, setCheckboxes] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

  // Radio state
  const [radioValue, setRadioValue] = useState('');

  // Select states
  const [singleSelect, setSingleSelect] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);

  // File upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');

  // Dynamic loading
  const [dynamicLoading, setDynamicLoading] = useState(false);
  const [dynamicContent, setDynamicContent] = useState<string | null>(null);

  // Drag and drop
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const dragItem = useRef<number | null>(null);

  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Slider states
  const [singleSlider, setSingleSlider] = useState([50]);
  const [rangeSlider, setRangeSlider] = useState([25, 75]);

  // Table selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Infinite scroll state
  const [infiniteItems, setInfiniteItems] = useState<string[]>(
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autocomplete state
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [autocompleteInput, setAutocompleteInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadedFile(file.name);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleAlert = () => {
    alert('This is a JavaScript alert!');
  };

  const handleConfirm = () => {
    const result = confirm('Do you confirm this action?');
    alert(result ? 'You clicked OK' : 'You clicked Cancel');
  };

  const handlePrompt = () => {
    const result = prompt('Enter your name:', '');
    if (result) {
      alert(`Hello, ${result}!`);
    }
  };

  const handleDynamicLoad = () => {
    setDynamicLoading(true);
    setDynamicContent(null);
    
    setTimeout(() => {
      setDynamicContent('Content loaded successfully! This content appeared after a delay.');
      setDynamicLoading(false);
    }, 2000);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current !== null) {
      const item = items[dragItem.current];
      setItems(items.filter((_, i) => i !== dragItem.current));
      setDroppedItems([...droppedItems, item]);
      dragItem.current = null;
    }
  };

  const toggleMultiSelect = (value: string) => {
    setMultiSelect(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Table row selection handlers
  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(row => row.id));
    }
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoadingMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setIsLoadingMore(true);
      
      setTimeout(() => {
        setInfiniteItems(prev => [
          ...prev,
          ...Array.from({ length: 10 }, (_, i) => `Item ${prev.length + i + 1}`)
        ]);
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [isLoadingMore]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Filter countries for autocomplete
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(autocompleteInput.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="automation-lab-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="automation-lab-title">
          Automation Lab
        </h1>
        <p className="text-muted-foreground">
          Practice Selenium automation with various interactive elements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Checkboxes */}
        <Card data-testid="checkbox-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Checkboxes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(checkboxes).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setCheckboxes({ ...checkboxes, [key]: !!checked })
                  }
                  data-testid={`checkbox-${key}`}
                />
                <Label htmlFor={key}>Option {key.slice(-1)}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Radio Buttons */}
        <Card data-testid="radio-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Radio Buttons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={radioValue} onValueChange={setRadioValue} data-testid="radio-group">
              {['radio1', 'radio2', 'radio3'].map((id) => (
                <div key={id} className="flex items-center space-x-2">
                  <RadioGroupItem value={id} id={id} data-testid={`radio-${id}`} />
                  <Label htmlFor={id}>Radio {id.slice(-1)}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dropdowns */}
        <Card data-testid="dropdown-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronDown className="h-5 w-5" />
              Dropdowns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Single Select</Label>
              <Select value={singleSelect} onValueChange={setSingleSelect}>
                <SelectTrigger data-testid="single-select">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Multi Select</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]" data-testid="multi-select">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={multiSelect.includes(opt) ? 'default' : 'outline'}
                    onClick={() => toggleMultiSelect(opt)}
                    data-testid={`multi-option-${opt}`}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Picker */}
        <Card data-testid="datepicker-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Date Picker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Single Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    data-testid="single-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="pointer-events-auto"
                    data-testid="calendar-single"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                    data-testid="date-range-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                      ) : (
                        format(dateRange.from, "PPP")
                      )
                    ) : (
                      "Pick date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                    data-testid="calendar-range"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Sliders */}
        <Card data-testid="slider-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Sliders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Single Value</Label>
                <span className="text-sm text-muted-foreground" data-testid="single-slider-value">
                  {singleSlider[0]}
                </span>
              </div>
              <Slider
                value={singleSlider}
                onValueChange={setSingleSlider}
                max={100}
                step={1}
                data-testid="single-slider"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Range</Label>
                <span className="text-sm text-muted-foreground" data-testid="range-slider-value">
                  {rangeSlider[0]} - {rangeSlider[1]}
                </span>
              </div>
              <Slider
                value={rangeSlider}
                onValueChange={setRangeSlider}
                max={100}
                step={1}
                data-testid="range-slider"
              />
            </div>
          </CardContent>
        </Card>

        {/* Autocomplete */}
        <Card data-testid="autocomplete-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Autocomplete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Search Country</Label>
              <Popover open={autocompleteOpen} onOpenChange={setAutocompleteOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={autocompleteOpen}
                    className="w-full justify-between"
                    data-testid="autocomplete-trigger"
                  >
                    {autocompleteValue || "Select country..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover" align="start">
                  <Command data-testid="autocomplete-command">
                    <CommandInput 
                      placeholder="Search country..." 
                      value={autocompleteInput}
                      onValueChange={setAutocompleteInput}
                      data-testid="autocomplete-input"
                    />
                    <CommandList>
                      <CommandEmpty data-testid="autocomplete-empty">No country found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCountries.slice(0, 8).map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={(value) => {
                              setAutocompleteValue(value);
                              setAutocompleteOpen(false);
                            }}
                            data-testid={`autocomplete-item-${country.toLowerCase().replace(/\s/g, '-')}`}
                          >
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {autocompleteValue && (
                <p className="text-sm text-muted-foreground" data-testid="autocomplete-selected">
                  Selected: {autocompleteValue}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tooltip */}
        <Card data-testid="tooltip-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tooltip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" data-testid="tooltip-trigger">
                  Hover over me
                </Button>
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                <p>This is a tooltip message!</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Drag and Drop */}
        <Card data-testid="drag-drop-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GripVertical className="h-5 w-5" />
              Drag and Drop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Drag from here:</Label>
              <div className="space-y-2" data-testid="drag-source">
                {items.map((item, index) => (
                  <div
                    key={item}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    className="p-2 border rounded cursor-move bg-muted hover:bg-muted/80"
                    data-testid={`draggable-${index}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Drop here:</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="min-h-[80px] border-2 border-dashed rounded-lg p-2"
                data-testid="drop-target"
              >
                {droppedItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Drop items here</p>
                ) : (
                  droppedItems.map((item, i) => (
                    <div key={i} className="p-2 bg-primary/10 rounded mb-1">{item}</div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card data-testid="file-upload-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              data-testid="file-input"
            />
            {isUploading && (
              <div className="space-y-2" data-testid="upload-progress">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
              </div>
            )}
            {uploadedFile && (
              <p className="text-sm text-green-600" data-testid="uploaded-file">
                Uploaded: {uploadedFile}
              </p>
            )}
          </CardContent>
        </Card>

        {/* JS Alerts */}
        <Card data-testid="alerts-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              JavaScript Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleAlert} variant="outline" className="w-full" data-testid="alert-btn">
              Show Alert
            </Button>
            <Button onClick={handleConfirm} variant="outline" className="w-full" data-testid="confirm-btn">
              Show Confirm
            </Button>
            <Button onClick={handlePrompt} variant="outline" className="w-full" data-testid="prompt-btn">
              Show Prompt
            </Button>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card data-testid="modal-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="h-5 w-5" />
              Modal Dialog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setModalOpen(true)} data-testid="open-modal-btn">
              Open Modal
            </Button>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent data-testid="modal-dialog">
                <DialogHeader>
                  <DialogTitle>Modal Title</DialogTitle>
                  <DialogDescription>This is a modal dialog for testing.</DialogDescription>
                </DialogHeader>
                <Input
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  placeholder="Type something..."
                  data-testid="modal-input"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setModalOpen(false)} data-testid="modal-cancel">
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)} data-testid="modal-submit">
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* New Tab/Window */}
        <Card data-testid="new-tab-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              New Tab/Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" data-testid="new-tab-link">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                Open in New Tab
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic Loading */}
        <Card data-testid="dynamic-loading-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5" />
              Dynamic Loading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDynamicLoad} disabled={dynamicLoading} data-testid="start-loading-btn">
              {dynamicLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Start Loading'
              )}
            </Button>
            {dynamicContent && (
              <div className="p-4 bg-muted rounded-lg" data-testid="dynamic-content">
                {dynamicContent}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table with Row Selection */}
        <Card className="md:col-span-2" data-testid="table-selection-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Table with Row Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table data-testid="selectable-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === tableData.length}
                      onCheckedChange={toggleAllRows}
                      data-testid="select-all-rows"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow 
                    key={row.id}
                    className={cn(selectedRows.includes(row.id) && "bg-muted")}
                    data-testid={`table-row-${row.id}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={() => toggleRowSelection(row.id)}
                        data-testid={`select-row-${row.id}`}
                      />
                    </TableCell>
                    <TableCell data-testid={`row-${row.id}-id`}>{row.id}</TableCell>
                    <TableCell data-testid={`row-${row.id}-name`}>{row.name}</TableCell>
                    <TableCell data-testid={`row-${row.id}-email`}>{row.email}</TableCell>
                    <TableCell data-testid={`row-${row.id}-status`}>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-sm text-muted-foreground" data-testid="selected-count">
              {selectedRows.length} of {tableData.length} row(s) selected
            </p>
          </CardContent>
        </Card>

        {/* Infinite Scroll */}
        <Card data-testid="infinite-scroll-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Infinite Scroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto border rounded-lg"
              data-testid="infinite-scroll-container"
            >
              <div className="p-2 space-y-2">
                {infiniteItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg"
                    data-testid={`infinite-item-${index}`}
                  >
                    {item}
                  </div>
                ))}
                {isLoadingMore && (
                  <div className="flex items-center justify-center p-4" data-testid="infinite-loading">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground" data-testid="infinite-count">
              Loaded {infiniteItems.length} items
            </p>
          </CardContent>
        </Card>

        {/* iFrame */}
        <Card className="md:col-span-2 lg:col-span-3" data-testid="iframe-section">
          <CardHeader>
            <CardTitle>iFrame Section</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src="https://example.com"
              className="w-full h-48 border rounded-lg"
              title="Test iFrame"
              data-testid="test-iframe"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomationLab;
