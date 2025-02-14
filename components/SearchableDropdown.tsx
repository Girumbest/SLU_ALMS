import { useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

type select = {
  options: { name: string; id?: string }[]; //drop down items
  inputElementName: string; //<input> name used in a form submission
  title: string; //title for the drop down
};

export default function SearchableDropdown(props:select) {
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<{name: string; id:string}>({name:"", id: ""});
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const filteredOptions = props.options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative ">
      <div
        className=" flex justify-between items-center  p-3 pl-10 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input className="cursor-default" name={props.inputElementName} type="hidden" value={selected.id || ""}/>
        <span className="cursor-default">{selected.name || props.title}</span>
        <FaChevronDown className="absolute right-1.5 w-2.5 h-2.5" />
      </div>
      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-10">
          <div className="flex items-center p-2 border-b border-gray-200">
            <FaSearch className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </div>
          <ul className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelected({name: option.name, id: option.id || ""});
                    setIsOpen(false);
                  }}
                >
                  {option.name}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
