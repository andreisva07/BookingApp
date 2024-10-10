"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { ChangeEventHandler, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import qs from "query-string";
import { useDebounceValue } from "@/hooks/useDebounceValue";

const SearchInput = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "";
  const [value, setValue] = useState(title);
  const pathname = usePathname();
  const router = useRouter();

  const debounceValue = useDebounceValue<string>(value);

  useEffect(() => {
    console.log("Debounced value:", debounceValue);

    const currentQuery = qs.parse(searchParams.toString());
    const updatedQuery = {
      ...currentQuery,
      title: debounceValue || undefined,
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: updatedQuery,
      },
      { skipNull: true, skipEmptyString: true }
    );

    console.log("Generated URL:", url);

    router.push(url);
  }, [debounceValue, router, pathname, searchParams]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log("Input value:", e.target.value);
    setValue(e.target.value);
  };

  if (pathname !== "/") return null;

  return (
    <div className="relative sm:block hidden">
      <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search"
        className="pl-10 bg-primary/10"
      />
    </div>
  );
};

export default SearchInput;
