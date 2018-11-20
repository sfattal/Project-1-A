const element = <h2>Well it looks like you have: {sessionStorage.getItem("diagnosis")}</h2>;

ReactDOM.render(
    element,
    document.getElementById("root")
);