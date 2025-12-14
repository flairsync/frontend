import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useBusinessTags } from "@/features/business/tags/useBusinessTags";
import { BusinessTag } from "@/models/business/BusinessTag";

interface TagsDropdownProps {
  value: BusinessTag[];
  onChange: (tags: BusinessTag[]) => void;
  options?: string[];
  placeholder?: string;
}



const BusinessTagsInput: React.FC<TagsDropdownProps> = ({ value, onChange, options = [], placeholder }) => {
  const {
    businessTags
  } = useBusinessTags();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");


  const filtered = businessTags?.filter(
    (opt) => opt.name.toLowerCase().includes(search.toLowerCase()) && !value.includes(opt)
  );

  const addTag = (tag: BusinessTag) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setSearch("");
    setOpen(false);
  };

  const removeTag = (tag: BusinessTag) => {
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
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag.name}
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
              {filtered?.map((opt) => (
                <CommandItem key={opt.id} onSelect={() => addTag(opt)}>
                  {opt.name}
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
