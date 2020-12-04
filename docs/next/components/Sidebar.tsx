import Link from "next/link";
import cx from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";

import navigation from "../content/navigation.json";
import Icons from "../components/Icons";
import VersionedLink from "./VersionedLink";

const getCurrentSection = () => {
  const { asPath } = useRouter();
  const match = navigation.find(
    (item) => item.path !== "/" && asPath.startsWith(item.path)
  );
  return match || navigation.find((item) => item.path === "/");
};

const TopLevelNavigation = () => {
  const currentSection = getCurrentSection();

  return (
    <div className="space-y-1">
      {navigation.map((item) => {
        const match = item == currentSection;

        return (
          <VersionedLink href={item.path}>
            <a
              className={cx(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900",
                {
                  "bg-gray-200": match,
                  " hover:text-gray-900 hover:bg-gray-50": !match,
                }
              )}
            >
              <svg
                className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {/* @ts-ignore */}
                {Icons[item.icon]}
              </svg>
              {item.title}
            </a>
          </VersionedLink>
        );
      })}
    </div>
  );
};

const SecondaryNavigation = () => {
  const currentSection = getCurrentSection();

  if (!currentSection?.children) {
    return null;
  }

  return (
    <>
      {currentSection.children.map((section) => {
        if (section.path) {
          return (
            <div className="border-l-2">
              <div
                className="mt-1 space-y-1"
                role="group"
                aria-labelledby="teams-headline"
              >
                <RecursiveNavigation section={section} />
              </div>
            </div>
          );
        }

        return (
          <div className="mt-8">
            <h3
              className="px-3 text-xs font-semibold text-blue-500 uppercase tracking-wider"
              id="teams-headline"
            >
              {section.title}
            </h3>

            <div className="border-l-2 ml-3 mt-4">
              <div
                className="mt-1 ml-1 space-y-1"
                role="group"
                aria-labelledby="teams-headline"
              >
                {section.children.map((section) => {
                  return <RecursiveNavigation section={section} />;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const RecursiveNavigation = ({ section }) => {
  const { asPath, locale: version } = useRouter();

  return (
    <VersionedLink href={section.path}>
      <a
        className={cx(
          "group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50",
          { "bg-blue-100": section.path === asPath }
        )}
      >
        <span>{section.title}</span>
      </a>
    </VersionedLink>
  );
};

const Sidebar = () => {
  const { locale: currentVersion, locales: versions, asPath } = useRouter();

  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
  const [openVersionsDropdown, setOpenVersionsDropdown] = useState<boolean>(
    false
  );

  const openSidebar = () => {
    setOpenMobileMenu(true);
  };

  const closeSidebar = () => {
    setOpenMobileMenu(false);
  };

  const toggleVersionsDropdown = () => {
    setOpenVersionsDropdown(!openVersionsDropdown);
  };

  return (
    <>
      {/* Off-canvas menu for mobile, show/hide based on off-canvas menu state. */}
      <div className="hidden lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/*
  Off-canvas menu overlay, show/hide based on off-canvas menu state.

  Entering: "transition-opacity ease-linear duration-300"
    From: "opacity-0"
    To: "opacity-100"
  Leaving: "transition-opacity ease-linear duration-300"
    From: "opacity-100"
    To: "opacity-0"
*/}
          <div className="fixed inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-600 opacity-75" />
          </div>
          {/*
  Off-canvas menu, show/hide based on off-canvas menu state.

  Entering: "transition ease-in-out duration-300 transform"
    From: "-translate-x-full"
    To: "translate-x-0"
  Leaving: "transition ease-in-out duration-300 transform"
    From: "translate-x-0"
    To: "-translate-x-full"
*/}
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Close sidebar</span>
                {/* Heroicon name: x */}
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/workflow-logo-purple-500-mark-gray-700-text.svg"
                alt="Workflow"
              />
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2">
                <div className="space-y-1">
                  <a
                    href="#"
                    className="group flex items-center px-2 py-2 text-base leading-5 font-medium rounded-md text-gray-900 bg-gray-100 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {/* Heroicon name: home */}
                    <svg
                      className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Home
                  </a>
                  <a
                    href="#"
                    className="group flex items-center px-2 py-2 text-base leading-5 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {/* Heroicon name: view-list */}
                    <svg
                      className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    My tasks
                  </a>
                  <a
                    href="#"
                    className="group flex items-center px-2 py-2 text-base leading-5 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {/* Heroicon name: clock */}
                    <svg
                      className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Recent
                  </a>
                </div>
                <div className="mt-8">
                  <h3
                    className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    id="teams-headline"
                  >
                    Teams
                  </h3>
                  <div
                    className="mt-1 space-y-1"
                    role="group"
                    aria-labelledby="teams-headline"
                  >
                    <a
                      href="#"
                      className="group flex items-center px-3 py-2 text-base leading-5 font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <span
                        className="w-2.5 h-2.5 mr-4 bg-indigo-500 rounded-full"
                        aria-hidden="true"
                      />
                      <span className="truncate">Engineering</span>
                    </a>
                    <a
                      href="#"
                      className="group flex items-center px-3 py-2 text-base leading-5 font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <span
                        className="w-2.5 h-2.5 mr-4 bg-green-500 rounded-full"
                        aria-hidden="true"
                      />
                      <span className="truncate">Human Resources</span>
                    </a>
                    <a
                      href="#"
                      className="group flex items-center px-3 py-2 text-base leading-5 font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <span
                        className="w-2.5 h-2.5 mr-4 bg-yellow-500 rounded-full"
                        aria-hidden="true"
                      />
                      <span className="truncate">Customer Success</span>
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-gray-100">
          <div className="flex items-center flex-shrink-0 px-6">
            <a href="/">
              <span className="text-lg font-extrabold uppercase">Dagster</span>{" "}
              <span className="ml-1 text-lg text-gray-500 font-medium uppercase">
                Docs
              </span>
            </a>
          </div>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="h-0 flex-1 flex flex-col overflow-y-auto">
            {/* User account dropdown */}
            <div className="px-3 mt-4 relative inline-block text-left">
              {/* Dropdown menu toggle, controlling the show/hide state of dropdown menu. */}
              <div>
                <button
                  type="button"
                  className="group w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none border-2 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500"
                  id="options-menu"
                  aria-haspopup="true"
                  aria-expanded="true"
                  onClick={toggleVersionsDropdown}
                >
                  <span className="flex w-full justify-between items-center">
                    <span className="flex min-w-0 items-center justify-between space-x-3">
                      <span className="flex-1 min-w-0">
                        <span className="text-gray-900 text-sm font-medium truncate">
                          Version:
                        </span>{" "}
                        <span className="text-gray-500 text-sm truncate">
                          {currentVersion}
                        </span>
                      </span>
                    </span>
                    {/* Heroicon name: selector */}
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              </div>
              {/*
      Dropdown panel, show/hide based on dropdown state.

      Entering: "transition ease-out duration-100"
        From: "transform opacity-0 scale-95"
        To: "transform opacity-100 scale-100"
      Leaving: "transition ease-in duration-75"
        From: "transform opacity-100 scale-100"
        To: "transform opacity-0 scale-95"
    */}
              <div
                className={`${
                  openVersionsDropdown ? "" : "hidden"
                } z-10 mx-3 origin-top absolute right-0 left-0 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <div className="py-1">
                  {versions.map((version) => (
                    <Link href={asPath} locale={version}>
                      <a
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {version}
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    View All Versions
                  </a>

                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    Older Versions
                  </a>
                </div>
              </div>
            </div>
            {/* Sidebar Search */}
            <div className="hidden px-3 mt-5">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  aria-hidden="true"
                >
                  {/* Heroicon name: search */}
                  <svg
                    className="mr-3 h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search"
                />
              </div>
            </div>
            {/* Navigation */}
            <nav className="px-3 mt-6">
              <TopLevelNavigation />
              <div className="mt-8">
                <SecondaryNavigation />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
