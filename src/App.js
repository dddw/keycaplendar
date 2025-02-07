import React from "react";
import firebase from "./components/firebase";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createSnackbarQueue, SnackbarQueue } from "@rmwc/snackbar";
import { DesktopContent, TabletContent, MobileContent } from "./components/Content";
import { Login } from "./components/Login";
import { Users } from "./components/Users";
import "./App.scss";
import { PrivacyPolicy, TermsOfService } from "./components/Legal";
import { SnackbarCookies } from "./components/SnackbarCookies";

const queue = createSnackbarQueue();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: "desktop",
      theme: "light",
      bottomNav: false,
      page: "calendar",
      view: "card",
      transition: false,
      sort: "date",
      allVendors: [],
      allRegions: [],
      vendors: [],
      sets: [],
      profiles: [],
      filteredSets: [],
      groups: [],
      loading: false,
      content: true,
      search: "",
      user: { email: null, name: null, avatar: null, isEditor: false, isAdmin: false },
      whitelist: { vendors: [], profiles: [], edited: false },
      cookies: true,
    };
    this.changeView = this.changeView.bind(this);
    this.changePage = this.changePage.bind(this);
    this.getData = this.getData.bind(this);
    this.filterData = this.filterData.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.setSort = this.setSort.bind(this);
    this.setSearch = this.setSearch.bind(this);
  }
  getURLQuery = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      const pageQuery = params.get("page");
      const pages = ["calendar", "live", "ic", "previous", "timeline", "statistics"];
      if (pages.indexOf(pageQuery) > -1) {
        this.setState({ page: pageQuery });
        if (pageQuery === "calendar") {
          this.setState({ sort: "date" });
        } else if (pageQuery === "live") {
          this.setState({ sort: "profile" });
        } else if (pageQuery === "ic") {
          this.setState({ sort: "profile" });
        } else if (pageQuery === "previous") {
          this.setState({ sort: "date" });
        } else if (pageQuery === "timeline") {
          this.setState({ sort: "date" });
        }
      }
      this.getData();
    } else {
      this.getData();
    }
  };
  acceptCookies = () => {
    this.setState({ cookies: true });
    this.setCookie("accepted", true, 356);
  };
  clearCookies = () => {
    this.setState({ cookies: false });
    this.setCookie("accepted", false, -1);
  };
  setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  checkCookies = () => {
    const accepted = this.getCookie("accepted");
    if (accepted !== "" && accepted) {
      this.setState({ cookies: true });
      const theme = this.getCookie("theme");
      if (theme !== "") {
        setTimeout(() => {
          this.changeTheme(theme);
        }, 0);
      }
      const view = this.getCookie("view");
      if (view !== "") {
        setTimeout(() => {
          this.changeView(view);
        }, 0);
      }
      const bottomNav = this.getCookie("bottomNav");
      const bottomNavBool = (bottomNav === 'true');
      if (bottomNav !== "") {
        setTimeout(() => {
          this.changeBottomNav(bottomNavBool);
        }, 0);
      }
    } else {
      this.clearCookies();
    }
  };
  changeView(view) {
    if (view !== this.state.view && !this.state.loading) {
      this.setState({ transition: true });
      setTimeout(
        function () {
          document.documentElement.scrollTop = 0;
          this.setState({ view: view });
        }.bind(this),
        90
      );
      setTimeout(
        function () {
          this.setState({ transition: false });
        }.bind(this),
        300
      );
    } else {
      this.setState({ view: view });
    }
    if (this.state.cookies) {
      this.setCookie("view", view, 365);
    }
  }
  changePage(page) {
    if (page !== this.state.page && !this.state.loading) {
      this.setState({ transition: true });
      setTimeout(
        function () {
          this.setState({ page: page });
          this.setSearch("");
          if (page === "calendar") {
            this.setState({ sort: "date" });
          } else if (page === "live") {
            this.setState({ sort: "profile" });
          } else if (page === "ic") {
            this.setState({ sort: "profile" });
          } else if (page === "previous") {
            this.setState({ sort: "date" });
          } else if (page === "timeline") {
            this.setState({ sort: "date" });
          }
          this.filterData(page);
          document.documentElement.scrollTop = 0;
        }.bind(this),
        90
      );
      setTimeout(
        function () {
          this.setState({ transition: false });
        }.bind(this),
        300
      );
      const title = {
        calendar: "Calendar",
        live: "Live GBs",
        ic: "IC Tracker",
        previous: "Previous Sets",
        account: "Account",
        timeline: "Timeline",
        statistics: "Statistics",
      };
      document.title = "KeycapLendar: " + title[page];
      window.history.pushState(
        {
          page: page,
        },
        "KeycapLendar: " + title[page],
        "?page=" + page
      );
    }
  }
  changeTheme = (theme) => {
    this.setState({ theme: theme });
    document.querySelector("html").classList = theme;
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    if (this.state.cookies) {
      this.setCookie("theme", theme, 365);
    }
  };
  changeBottomNav = (value) => {
    document.documentElement.scrollTop = 0;
    this.setState({ bottomNav: value });
    if (this.state.cookies) {
      this.setCookie("bottomNav", value, 365);
    }
  };
  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }
  getData() {
    this.setState({ loading: true });
    const db = firebase.firestore();
    db.collection("keysets")
      .get()
      .then((querySnapshot) => {
        let sets = [];
        querySnapshot.forEach((doc) => {
          const gbLaunchDate = new Date(doc.data().gbLaunch);
          const lastOfMonth = new Date(gbLaunchDate.getUTCFullYear(), gbLaunchDate.getUTCMonth() + 1, 0);
          const gbLaunch =
            doc.data().gbMonth && doc.data().gbLaunch !== ""
              ? doc.data().gbLaunch + "-" + lastOfMonth.getUTCDate()
              : doc.data().gbLaunch;
          sets.push({
            id: doc.id,
            profile: doc.data().profile,
            colorway: doc.data().colorway,
            designer: doc.data().designer,
            icDate: doc.data().icDate,
            details: doc.data().details,
            image: doc.data().image,
            gbMonth: doc.data().gbMonth,
            gbLaunch: gbLaunch,
            gbEnd: doc.data().gbEnd,
            shipped: doc.data().shipped,
            vendors: doc.data().vendors,
          });
        });

        sets.sort(function (a, b) {
          var x = a.colorway.toLowerCase();
          var y = b.colorway.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

        this.setState({
          sets: sets,
        });
        this.filterData(this.state.page, sets);
      })
      .catch((error) => {
        console.log("Error getting data: " + error);
        queue.notify({ title: "Error getting data: " + error });
      });
  }
  filterData(
    page = this.state.page,
    sets = this.state.sets,
    sort = this.state.sort,
    search = this.state.search,
    whitelist = this.state.whitelist
  ) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let pageSets = [];
    let allRegions = [];
    let allVendors = [];
    let usVendors = [];
    let allProfiles = [];
    let groups = [];

    // page logic
    if (page === "calendar") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate > today || (startDate <= today && (endDate >= yesterday || set.gbEnd === ""));
      });
    } else if (page === "live") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate <= today && (endDate >= yesterday || set.gbEnd === "");
      });
    } else if (page === "ic") {
      pageSets = sets.filter((set) => {
        const startDate = set.gbLaunch.includes("Q") || set.gbLaunch === "" ? set.gbLaunch : new Date(set.gbLaunch);
        return !startDate || startDate === "" || set.gbLaunch.includes("Q");
      });
    } else if (page === "previous") {
      pageSets = sets.filter((set) => {
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return endDate <= yesterday;
      });
    } else if (page === "timeline") {
      pageSets = sets.filter((set) => {
        return set.gbLaunch !== "" && !set.gbLaunch.includes("Q");
      });
    }

    // lists
    sets.forEach((set) => {
      if (set.vendors[0]) {
        if (!usVendors.includes(set.vendors[0].name)) {
          usVendors.push(set.vendors[0].name);
        }
        set.vendors.forEach((vendor) => {
          if (!allVendors.includes(vendor.name)) {
            allVendors.push(vendor.name);
          }
          if (!allRegions.includes(vendor.region)) {
            allRegions.push(vendor.region);
          }
        });
      }
      if (!allProfiles.includes(set.profile)) {
        allProfiles.push(set.profile);
      }
    });

    usVendors.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allVendors.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allRegions.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allProfiles.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    // whitelist logic

    if (!whitelist.edited) {
      this.setWhitelist("vendors", allVendors);
      this.setWhitelist("profiles", allProfiles);
    }

    const filteredSets = pageSets.filter((set) => {
      if (set.vendors.length > 0) {
        return whitelist.vendors.indexOf(set.vendors[0].name) > -1 && whitelist.profiles.indexOf(set.profile) > -1;
      } else {
        if (whitelist.vendors.length === 1) {
          return false;
        } else {
          return whitelist.profiles.indexOf(set.profile) > -1;
        }
      }
    });

    // search logic

    const searchSets = (search) => {
      return filteredSets.filter((set) => {
        let setInfo =
          set.profile +
          " " +
          set.colorway +
          " " +
          set.vendors.map((vendor) => {
            return " " + vendor.name + " " + vendor.region;
          }) +
          " " +
          set.designer.toString();
        return setInfo.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
    };

    const searchedSets = search !== "" ? searchSets(search) : filteredSets;

    // group display
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    searchedSets.forEach((set) => {
      if (sort === "date") {
        const setDate = new Date(page === "live" ? set.gbEnd : set.gbLaunch);
        let setMonth = months[setDate.getUTCMonth()] + " " + setDate.getUTCFullYear();
        if (!groups.includes(setMonth) && setMonth !== "undefined NaN") {
          groups.push(setMonth);
        }
      } else if (sort === "vendor") {
        if (set.vendors[0]) {
          if (!groups.includes(set.vendors[0].name)) {
            groups.push(set.vendors[0].name);
          }
        }
      } else {
        if (!groups.includes(set[sort])) {
          groups.push(set[sort]);
        }
      }
    });
    groups.sort(function (a, b) {
      if (sort === "date") {
        const aMonth = "0" + (months.indexOf(a.slice(0, -5)) + 1);
        const bMonth = "0" + (months.indexOf(b.slice(0, -5)) + 1);
        const aDate = `${a.slice(-4)}-${aMonth.slice(-2)}-01`;
        const bDate = `${b.slice(-4)}-${bMonth.slice(-2)}-01`;
        if (page === "previous") {
          if (aDate < bDate) {
            return 1;
          }
          if (aDate > bDate) {
            return -1;
          }
        } else {
          if (aDate < bDate) {
            return -1;
          }
          if (aDate > bDate) {
            return 1;
          }
        }
      } else {
        const x = a.toLowerCase();
        const y = b.toLowerCase();
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
      }
      return 0;
    });

    // set states
    this.setState({
      filteredSets: searchedSets,
      allRegions: allRegions,
      allVendors: allVendors,
      vendors: usVendors,
      profiles: allProfiles,
      groups: groups,
      content: searchedSets.length > 0 ? true : false,
      loading: false,
    });
  }
  setSort(sortBy) {
    const sort = ["vendor", "date", "profile"];
    document.documentElement.scrollTop = 0;
    this.setState({ sort: sort[sortBy] });
    this.filterData(this.state.page, this.state.sets, sort[sortBy]);
  }
  setSearch(query) {
    this.setState({
      search: query,
    });
    document.documentElement.scrollTop = 0;
    this.filterData(this.state.page, this.state.sets, this.state.sort, query);
  }
  setUser = (user) => {
    this.setState({ user: user });
  };
  setWhitelist = (property, values) => {
    let whitelistCopy = this.state.whitelist;
    whitelistCopy[property] = values;
    whitelistCopy.edited = true;
    this.setState({
      whitelist: whitelistCopy,
    });
    document.documentElement.scrollTop = 0;
    this.filterData(this.state.page, this.state.sets, this.state.sort, this.props.search, whitelistCopy);
  };
  setDevice = () => {
    let i = 0;
    let device;
    let lastWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const calculate = () => {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (vw !== lastWidth || i === 0) {
        if (vw >= 840) {
          device = "desktop";
        } else if (vw < 840 && vw >= 480) {
          device = "tablet";
        } else {
          device = "mobile";
        }
        if (device === "mobile" && this.state.device !== "mobile") {
          this.setState({ view: "list" });
        }
        this.setState({ device: device });
        lastWidth = vw;
        i++;
      }
    };
    calculate();
    window.addEventListener("resize", calculate);
  };
  componentDidMount() {
    this.setDevice();
    this.getURLQuery();
    this.checkCookies();
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    document.querySelector("html").classList = this.state.theme;
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const isEditorFn = firebase.functions().httpsCallable("isEditor");
        isEditorFn()
          .then((result) => {
            const isEditor = result.data;
            const isAdminFn = firebase.functions().httpsCallable("isAdmin");
            isAdminFn()
              .then((result) => {
                this.setUser({
                  email: user.email,
                  name: user.displayName,
                  avatar: user.photoURL,
                  isEditor: isEditor,
                  isAdmin: result.data,
                });
              })
              .catch((error) => {
                console.log("Error verifying admin access: " + error);
                queue.notify({ title: "Error verifying admin access: " + error });
                this.setUser({
                  email: user.email,
                  name: user.displayName,
                  avatar: user.photoURL,
                  isEditor: isEditor,
                  isAdmin: false,
                });
              });
          })
          .catch((error) => {
            console.log("Error verifying editor access: " + error);
            queue.notify({ title: "Error verifying editor access: " + error });
            this.setUser({
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              isEditor: false,
              isAdmin: false,
            });
          });
      } else {
        this.setUser({
          email: null,
          name: null,
          avatar: null,
          isEditor: false,
          isAdmin: false,
        });
      }
    });
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const device = this.state.device;
    let content;
    if (device === "desktop") {
      content = (
        <DesktopContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          theme={this.state.theme}
          changeTheme={this.changeTheme}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          snackbarQueue={queue}
        />
      );
    } else if (device === "tablet") {
      content = (
        <TabletContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          theme={this.state.theme}
          changeTheme={this.changeTheme}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          snackbarQueue={queue}
        />
      );
    } else {
      content = (
        <MobileContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          theme={this.state.theme}
          changeTheme={this.changeTheme}
          bottomNav={this.state.bottomNav}
          changeBottomNav={this.changeBottomNav}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          snackbarQueue={queue}
        />
      );
    }
    return (
      <Router>
        <Switch>
          <Route path="/users">
            <div>
              <Users admin={this.state.user.isAdmin} user={this.state.user} snackbarQueue={queue} />
              <SnackbarQueue messages={queue.messages} />
            </div>
          </Route>
          <Route path="/login">
            <Login device={this.state.device} user={this.state.user} setUser={this.setUser} />
          </Route>
          <Route path="/privacy">
            <PrivacyPolicy />
          </Route>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/">
            <div className="app">
              {content}
              <SnackbarQueue messages={queue.messages} />
              <SnackbarCookies open={!this.state.cookies} accept={this.acceptCookies} clear={this.clearCookies} />
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
