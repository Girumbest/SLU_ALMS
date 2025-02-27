import { useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

type SelectProps = {
  options: { name: string; id?: string }[]; // Dropdown items
};

export default function SearchInput(props: SelectProps) {
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<{ name: string; id: string }>({ name: "", id: "" });
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Filter options based on search input
  const filteredOptions = props.options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true); // Open dropdown when typing
  };

  // Handle option selection
  const handleSelectOption = (option: { name: string; id?: string }) => {
    setSelected({ name: option.name, id: option.id || "" });
    setSearch(option.name); // Update input value with selected option
    setIsOpen(false); // Close dropdown after selection
  };

  // Handle input blur with a delay to allow onClick to fire first
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative col-span-2">
      <div className={"w-full  bg-white border  rounded  z-10"}>
        <div className="flex items-center p-2 ">
          <FaSearch className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Supervisor"
            value={search}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onBlur={handleBlur}
            className="w-full  outline-none"
          />
          <input name="supervisor" type="hidden" value={selected.id} />
        </div>
        {isOpen && (
          <ul className="absolute w-full bg-white border rounded  z-10 max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.name}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}