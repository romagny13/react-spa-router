import * as React from 'react';

class About extends React.Component<any, any> {
    render() {
        return (
            <div style={{ background: this.props.background }}>
                <h1>About</h1>
            </div>
        );
    }
}

export default About;
