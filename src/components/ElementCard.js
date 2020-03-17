import React from 'react';
import { Typography } from '@rmwc/typography';
import { Card, CardMedia, CardPrimaryAction } from '@rmwc/card';
import './ElementCard.scss';

export class ElementCard extends React.Component {
    render() {
        return (
            <div className='card-container'>
                <Card className={(this.props.selected ? "selected" : "")} onClick={() => this.props.details(this.props.set)}>
                    <CardPrimaryAction>
                        <CardMedia sixteenByNine style={{ backgroundImage: 'url(' + this.props.image + ')' }} />
                        <div className="text-row" onClick={this.toggleExpand}>
                            <div className="text-container">
                                <Typography use="overline" tag="h3">{this.props.designer}</Typography>
                                <div className="title">
                                    <div className="time-indicator">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12.07 6.01c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm1 8h-2v-6h2v6z" opacity=".3" /><path d="M9.07 1.01h6v2h-6zm2 7h2v6h-2zm8.03-.62l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.14 4.74 14.19 4 12.07 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.11-.74-4.07-1.97-5.61zm-7.03 12.62c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
                                    </div>
                                    <Typography use="headline5" tag="h2">{this.props.title}</Typography>
                                </div>
                                <Typography use="subtitle2" tag="p">{this.props.subtitle}</Typography>
                            </div>
                        </div>
                    </CardPrimaryAction>
                </Card>
            </div>
        )
    }
}

export default ElementCard;