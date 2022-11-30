const navBoxGroups = document.querySelector(
  `.nav-section-txt[data-nav-info="groups"]`
);
const navBoxProfile = document.querySelector(
  `.nav-section-txt[data-nav-info="profile"]`
);
const navDropdownGroups = document.querySelector(
  ".dropdown-groups[data-nav-dropdown-col]"
);
const navDropdownProfile = document.querySelector(
  ".dropdown-profile[data-nav-dropdown-col]"
);
let thisgroupExist = true;

if (document.querySelector(`.nav-section-txt[data-nav-info="thisgroup"]`)) {
  navBoxThisgroup = document.querySelector(
    `.nav-section-txt[data-nav-info="thisgroup"]`
  );
} else {
  thisgroupExist = false;
}
if (document.querySelector(".dropdown-thisgroup[data-nav-dropdown-col]")) {
  navDropdownThisgroup = document.querySelector(
    ".dropdown-thisgroup[data-nav-dropdown-col]"
  );
} else {
  thisgroupExist = false;
}

const navBoxs = [navBoxGroups, navBoxProfile];

if (thisgroupExist) {
  navBoxs[2] = navBoxThisgroup;
}

navBoxGroups.addEventListener("click", () => {
  navDropdownProfile.setAttribute("data-nav-dropdown-col", "inactive");
  const childrensProfile = navBoxProfile.children;
  childrensProfile[0].textContent = "+";
  if (thisgroupExist) {
    navDropdownThisgroup.setAttribute("data-nav-dropdown-col", "inactive");
    const childrensThisgroup = navBoxThisgroup.children;
    childrensThisgroup[1].textContent = "+";
  }
  updateNavBar(navDropdownGroups, navBoxGroups);
});

navBoxProfile.addEventListener("click", () => {
  navDropdownGroups.setAttribute("data-nav-dropdown-col", "inactive");
  const childrensGroups = navBoxGroups.children;
  childrensGroups[0].textContent = "+";
  if (thisgroupExist) {
    navDropdownThisgroup.setAttribute("data-nav-dropdown-col", "inactive");
    const childrensThisgroup = navBoxThisgroup.children;
    childrensThisgroup[1].textContent = "+";
  }
  updateNavBar(navDropdownProfile, navBoxProfile);
});


if (thisgroupExist) {
  navBoxThisgroup.addEventListener("click", () => {
    navDropdownGroups.setAttribute("data-nav-dropdown-col", "inactive");
    const childrensGroups = navBoxGroups.children;
    childrensGroups[0].textContent = "+";
    navDropdownProfile.setAttribute("data-nav-dropdown-col", "inactive");
    const childrensProfile = navBoxProfile.children;
    childrensProfile[0].textContent = "+";
    updateNavBar(navDropdownThisgroup, navBoxThisgroup);
  });
}

function updateNavBar(navDropdownType, navBoxType) {
  const navAttribute = navDropdownType.getAttribute("data-nav-dropdown-col");
  const childrens = navBoxType.children;
  if(childrens[0].hasAttribute("id")){
    childrens[1].textContent = "+";
  }else{
    childrens[0].textContent = "+";
  }
  if (navAttribute === "inactive") {
    navDropdownType.setAttribute("data-nav-dropdown-col", "active");
    if(childrens[0].hasAttribute("id")){
      childrens[1].textContent = "-";
    }else{
      childrens[0].textContent = "-";
    }
  }
  if (navAttribute === "active") {
    navDropdownType.setAttribute("data-nav-dropdown-col", "inactive");
  }
}

const navCollapsedSwitch = document.querySelector(".nav-collapsed-switch");

navCollapsedSwitch.addEventListener("touchstart", () => {
  const NavbarCollapsed = document.querySelector(".nav-collapsed");
  NavbarCollapsed.style = "right: 0;";
});

const closeCollapsed = document.querySelector(".close-collapsed");

closeCollapsed.addEventListener("touchstart", () => {
  const NavbarCollapsed = document.querySelector(".nav-collapsed");
  NavbarCollapsed.style = "right: -50vw;";
});
