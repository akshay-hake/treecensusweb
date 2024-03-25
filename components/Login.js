import React, { useEffect, useState } from 'react';
import Map from './map';
import CSVFileReader from './CSVReader';

const Login = () => {
  const [isMap, setIsMap] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    let x = localStorage.getItem("loginuser")
    if(x) {
      setUsername(x)
      setTimeout(() => {
        setIsMap(true);
        setLoginError(false);
      }, 100)
      
    }
  },[])

  const handleLogin = () => {
    // Check if the entered credentials match the expected values
    console.log(username, password)
    if ((username === 'venviro' && password === 'Admin@123') || (username === 'manwath' && password === 'Manwath@123')) {
      setIsMap(true);
      setLoginError(false);
      localStorage.setItem("loginuser", username)
    } else {
      setLoginError(true);
    }
  };

  return (
    <div>
      {isMap ? (
        <CSVFileReader user={username}/>
      ) : (
        <div id="loginform">
          {/* <FormHeader title="Login" /> */}
          <Form
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
          {loginError && <p className="error">Invalid username or password</p>}
        </div>
      )}
    </div>
  );
};

const FormHeader = (props) => <h2 id="headerTitle">{props.title}</h2>;

const Form = (props) => (
  // <div>
  //   <div className='row'>
  //   <input
  //     description="Username"
  //     placeholder="Enter your username"
  //     type="text"
  //     onChange={(ev) => {
  //       props.setUsername(ev.target.value);
  //     }}
  //   />
  //   </div>
  //   <div className='row'>
  //   <input
  //     description="Password"
  //     placeholder="Enter your password"
  //     type="password"
  //     onChange={(ev) => {
  //       props.setPassword(ev.target.value);
  //     }}
  //   />
  //   </div>
  //   <FormButton title="Log in" handleLogin={props.handleLogin} />
  // </div>
  <div>
    <div id="back">
  <canvas id="canvas" class="canvas-back"></canvas>
  <div class="backRight">   
  
  </div>
  <div class="backLeft">
  <div className='bg-image'/> 
  </div>
</div>

<div id="slideBox">
  <div class="topLayer">
    <div class="left">
      <div class="content">
        <h2>Sign Up</h2>
        <form id="form-signup" method="post" onsubmit="return false;">
          <div class="form-element form-stack">
            <label for="email" class="form-label">Email</label>
            <input id="email" type="email" name="email" 
            onChange={(ev) => {
                    props.setUsername(ev.target.value);
                  }}/>
          </div>
          <div class="form-element form-stack">
            <label for="username-signup" class="form-label">Username</label>
            <input id="username-signup" type="text" name="username"/>
          </div>
          <div class="form-element form-stack">
            <label for="password-signup" class="form-label">Password</label>
            <input id="password-signup" type="password" name="password"/>
          </div>
          <div class="form-element form-checkbox">
            <input id="confirm-terms" type="checkbox" name="confirm" value="yes" class="checkbox"/>
            <label for="confirm-terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          </div>
          <div class="form-element form-submit">
            {/* <button id="signUp" class="signup" type="submit" name="signup">Sign up</button> */}
            <button id="goLeft" class="signup off" onClick={props.handleLogin}>Log In</button> 
          </div>
        </form>
      </div>
    </div>
    <div class="right">
      <div class="content">
        <h2 style={{marginBottom:"15%", color:"green"}}>Tree Census</h2>
        <h2>Login</h2>
        <form id="form-login" method="post" onsubmit="return false;">
          <div class="form-element form-stack">
            <label for="username-login" class="form-label">Username</label>
            <input id="username-login" type="text" name="username"
            onChange={(ev) => {
              props.setUsername(ev.target.value);
            }}/>
          </div>
          <div class="form-element form-stack">
            <label for="password-login" class="form-label">Password</label>
            <input id="password-login" type="password" name="password"
            onChange={(ev) => {
                    props.setPassword(ev.target.value);
                  }}
            />
          </div>
          <div class="form-element form-submit">
            <button id="logIn" class="login" type="submit" name="login" onClick={props.handleLogin}>Log In</button>
            {/* <button id="goRight" class="login off" name="signup">Sign Up</button> */}
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
  </div>

);

const FormButton = (props) => (
  <div id="button" className="row">
    <button onClick={props.handleLogin}>{props.title}</button>
  </div>
);

const FormInput = (props) => (
  <div className="row">
    <label>{props.description}</label>
    <input type={props.type} placeholder={props.placeholder} />
  </div>
);

export default Login;
