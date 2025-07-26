"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchInput = () => {
  const [searchQuery, setsearchQuery] = useState("");
  const router = useRouter();
  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const encodedSearchQuery = encodeURI(searchQuery);
    router.push(`/search?q=${encodedSearchQuery}`);
  };
  return (
    <form className="flex justify-center w-2/3" onSubmit={onSearch}>
      <input
        value={searchQuery}
        onChange={(event) => setsearchQuery(event.target.value)}
        placeholder="What are you looking for?."
        className="bg-purple-600"
      />
    </form>
  );
};

export default SearchInput;