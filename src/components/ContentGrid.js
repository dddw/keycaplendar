import React from "react";
import { Typography } from "@rmwc/typography";
import { ViewCard } from "./ViewCard";
import { ViewList } from "./ViewList";
import { ViewImageList } from "./ViewImageList";
import { ViewCompact } from "./ViewCompact";

import "./ContentGrid.scss";

export class ContentGrid extends React.Component {
  filterSets = (sets, group, sort, page) => {
    let filteredSets = [];
    sets.forEach((set) => {
      if (sort === "date") {
        const query = page === "live" ? "gbEnd" : "gbLaunch";
        const month = [
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
        const setDate = new Date(set[query]);
        let setMonth = month[setDate.getUTCMonth()] + " " + setDate.getUTCFullYear();
        if (setMonth === group) {
          filteredSets.push(set);
        }
      } else if (sort === "vendor") {
        if (set.vendors[0]) {
          if (set.vendors[0].name === group) {
            filteredSets.push(set);
          }
        }
      } else {
        if (set[sort] === group) {
          filteredSets.push(set);
        }
      }
    });
    filteredSets.sort((a, b) => {
      if (a.gbLaunch < b.gbLaunch) {
        return -1;
      }
      if (a.gbLaunch > b.gbLaunch) {
        return 1;
      }
      const aName = a.profile + " " + a.colorway;
      const bName = b.profile + " " + b.colorway;
      if (aName > bName) {
        return 1;
      } else if (aName < bName) {
        return -1;
      }
      return 0;
    });
    return filteredSets;
  };
  createGroup = (sets) => {
    if (this.props.view === "card") {
      return (
        <ViewCard
          sets={sets}
          page={this.props.page}
          details={this.props.details}
          closeDetails={this.props.closeDetails}
          detailSet={this.props.detailSet}
        />
      );
    } else if (this.props.view === "list") {
      return (
        <ViewList
          sets={sets}
          page={this.props.page}
          details={this.props.details}
          closeDetails={this.props.closeDetails}
          detailSet={this.props.detailSet}
        />
      );
    } else if (this.props.view === "imageList") {
      return (
        <ViewImageList
          sets={sets}
          page={this.props.page}
          details={this.props.details}
          closeDetails={this.props.closeDetails}
          detailSet={this.props.detailSet}
        />
      );
    } else if (this.props.view === "compact") {
      return (
        <ViewCompact
          sets={sets}
          page={this.props.page}
          details={this.props.details}
          closeDetails={this.props.closeDetails}
          detailSet={this.props.detailSet}
        />
      );
    }
  };
  render() {
    return (
      <div className="content-grid">
        {this.props.groups.map((value, index) => {
          const filteredSets = this.filterSets(this.props.sets, value, this.props.sort, this.props.page);
          return (
            <div className="outer-container" key={index}>
              <div className="subheader">
                <Typography use="caption" key={index}>
                  {value} <b>({filteredSets.length})</b>
                </Typography>
              </div>
              {this.createGroup(filteredSets)}
            </div>
          );
        })}
      </div>
    );
  }
}
export default ContentGrid;
