import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { roomTranslations, themeTranslations } from "../utils/dropdownTypes";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export type DropDownProps = {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
};

export default function DropDown({ theme, setTheme, themes }: DropDownProps) {
  return (
    <Menu as="div" className="relative block text-left w-full">
      <div>
        <Menu.Button className="inline-flex w-full justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {themeTranslations[theme as keyof typeof themeTranslations] || roomTranslations[theme as keyof typeof roomTranslations] || theme}
          <ChevronUpIcon
            className="-mr-1 ml-2 h-5 w-5 ui-open:hidden text-gray-500"
            aria-hidden="true"
          />
          <ChevronDownIcon
            className="-mr-1 ml-2 h-5 w-5 hidden ui-open:block text-gray-500"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          key={theme}
        >
          <div className="">
            {themes.map((themeItem) => (
              <Menu.Item key={themeItem}>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(themeItem)}
                    className={classNames(
                      active ? "bg-blue-50 text-blue-700" : "text-gray-700",
                      theme === themeItem ? "bg-gray-200" : "",
                      "px-4 py-2 text-sm w-full text-left flex items-center space-x-2 justify-between"
                    )}
                  >
                    <span>{themeTranslations[themeItem as keyof typeof themeTranslations] || roomTranslations[themeItem as keyof typeof roomTranslations] || themeItem}</span>
                    {theme === themeItem ? (
                      <CheckIcon className="w-4 h-4 text-blue-600" />
                    ) : null}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
