import React, { Component } from "react";
import Joke from "./Joke";
import axios from "axios"; //Dış kaynaklara http requesti atmamızı sağlayan kütüphane
import uuid from "uuid/v4";
import "./JokeList.css";
import SearchJokes from './SearchJokes';

class JokeList extends Component {
  static defaultProps = { //prop (erişim this.props.numJokes...)
    numJokesToGet: 10
  };
  constructor(props) {
    super(props); // Parent class constructor'ına işaret eder, yani Component sınıfı (bunu yazmadan this kullanamıyorsun)
    //Artık this kullanabilirsin
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
      stats: [],
      searchField:'',
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this); //handleClick metodu
  }
  componentDidMount() { //Component düzgün mount edildi mi (edilmediyse şakalar gelmeyecektir) (lifecycle)
    if (this.state.jokes.length === 0) this.getJokes();
  }//ComponentDidMount yaygın metod
  async getJokes() { //async fonksiyonlar promise döndürür (return değeri açık bir şekilde promise olmasa bile)
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) { 
          jokes.push({ id: uuid(), text: newJoke, votes: 0 }); // uuid bir fonksiyon olarak kullanılıyor ve şakalara unique id değerleri atıyor
          
        } else {
          console.log("Duplike Şaka var.");
          console.log(newJoke);
        }
      }
      
      this.setState(//Döngüyü kırınca loading state'i false'a eşitleniyor jokes da []'dan yeni haline eşitleniyor.
        st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
          
        }),
        () =>
          {window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))}
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  } 
 
  handleVote(id, delta) {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }
  handleVoteDifferently(text) {
    if(text.includes(" I ")||text.includes("I ")){
        return true;
    }
    else{
      return false;
    }
  }
  render() {
 
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      );
    }
    
    let jokes=this.state.jokes

    if(jokes.length>20){
      jokes.splice(0, jokes.length-20)
    }
    this.state.jokes.sort((a, b) => a.votes - b.votes);
    const filteredJokes=jokes.filter(j => (j.text.toLowerCase().includes(this.state.searchField.toLowerCase())))
    return (
      <div className='JokeList'>
        {/* <div className='Search'>
          <SearchJokes placeholder="Search joke!" handleChange={(e) => this.setState({searchField: e.target.value})}/>
        </div> */}
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'>
            <span>Dad</span> Jokes
          </h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokeList-getmore' onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>
        

        
        <div className='JokeList-jokes'>
        <SearchJokes placeholder="Search joke!" handleChange={(e) => this.setState({searchField: e.target.value})}/>
          {filteredJokes.map(j => (
            
            <Joke //Joke'a props gönderiyoruz
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() =>  this.handleVoteDifferently(j.text)? this.handleVote(j.id, 3) : this.handleVote(j.id, 2)}
              downvote={() => this.handleVote(j.id, -1)}
              
            />
          ))}
        </div>
      </div>
    );
  }
}
export default JokeList;
