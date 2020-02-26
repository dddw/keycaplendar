import React from 'react';
import { Checkbox } from '@rmwc/checkbox';

export class CheckboxFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isChecked: true }
        this.toggleChecked = this.toggleChecked.bind(this);
    }
    toggleChecked() {
        this.setState({isChecked: !this.state.isChecked});
    }
    render() {
        return (
            <Checkbox label={this.props.label} checked={this.state.isChecked} onChange={this.toggleChecked}/>
        );
    }
}

export default CheckboxFilter;