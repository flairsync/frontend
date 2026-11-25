import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useBusinessTags } from "@/features/business/tags/useBusinessTags";
import { BusinessTag } from "@/models/business/BusinessTag";
import { useTranslation } from "react-i18next";

interface TagsDropdownProps {
  value: BusinessTag[];
  onChange: (tags: BusinessTag[]) => void;
  options?: string[];
  placeholder?: string;
}



const BusinessTagsInput: React.FC<TagsDropdownProps> = ({ value, onChange, options = [], placeholder }) => {
  const { t } = useTranslation();
  const {
    businessTags
  } = useBusinessTags();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");


  const filtered = businessTags?.filter(
    (opt) => t(`shared.tags.${opt.name}`, opt.name).toLowerCase().includes(search.toLowerCase()) && !value.includes(opt)
  );

  const addTag = (tag: BusinessTag) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setSearch("");
  };

  const removeTag = (tag: BusinessTag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    // P1-13 (QA round 4, 2026-11-19): the wizard's own outer label
    // (create_business_page.step2.tags_label, "Business Tags") already labels this — this
    // component's own inner label duplicated it ("Business Tags" / "Tags").
    <div className="space-y-2">
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
              {t(`shared.tags.${tag.name}`, tag.name)}
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
            {placeholder || t("shared.tags_placeholder")}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filtered?.map((opt) => (
                <CommandItem key={opt.id} onSelect={() => addTag(opt)}>
                  {t(`shared.tags.${opt.name}`, opt.name)}
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
