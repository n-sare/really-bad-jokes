import React, { Component } from "react";
import "./SearchJokes.css";

const SearchJokes = (props) =>{
    return(
        <input type="search"
        className='search'
        placeholder={props.placeholder}
        onChange= {props.handleChange} />
        ) 
}
export default SearchJokes;
