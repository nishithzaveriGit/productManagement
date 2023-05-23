/* eslint-disable */
import React from 'react';
// import { navigate } from 'react-router-dom'


const Header = () => {
    const navigate = () =>{

    }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
            <button type="button" onClick={navigate} className="btn btn-primary">Add Product</button>
        </div>
    </nav>
  )
}

export default Header;