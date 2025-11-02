import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TagsDropdownProps {
  value: string[];
  onChange: (tags: string[]) => void;
  options?: string[];
  placeholder?: string;
}

const tagOptions = ["vegan", "brunch", "cozy", "family-friendly", "romantic"];


const BusinessTagsInput: React.FC<TagsDropdownProps> = ({ value, onChange, options = [], placeholder }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = tagOptions.filter(
    (opt) => opt.toLowerCase().includes(search.toLowerCase()) && !value.includes(opt)
  );

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setSearch("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="font-medium text-sm text-gray-700">Tags</label>

      {/* Display Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown Search */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setOpen(true)}
          >
            {placeholder || "Select or type tags..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[250px]">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filtered.map((opt) => (
                <CommandItem key={opt} onSelect={() => addTag(opt)}>
                  {opt}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BusinessTagsInput;
