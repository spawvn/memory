(function(){
	//Shortcuts
	function ce(e){return document.createElement(e);}
	function id(e){return document.getElementById(e);}
	function qs(e){return document.querySelectorAll(e);}
	
	//Main object
	var Game = function(pa, ds){
		this.play_area = pa;
		this.deck_size = ds;
		return this;
	}

	Game.prototype.init = function() {
		//Prepare cards
		var deck = new this.Deck(this);
		deck.shuffle();
		deck.cut();
		deck.double_set();
		deck.shuffle();
		deck.deal(this.play_area);
		
		this.deck = deck;
		
		//Scores reset
		id('player_1_score').innerHTML = '0';
		id('player_2_score').innerHTML = '0';
		this.player_switch();
	}
		
	//Add score to current player
	Game.prototype.add_score = function(){
		var obj = qs('aside .active .score');
		obj[0].innerHTML = parseInt(obj[0].innerHTML)+1;
	}
			
	//Final score count
	Game.prototype.announce_winner = function(){
		var p1s = parseInt(id('player_1_score').innerHTML),
			p2s = parseInt(id('player_2_score').innerHTML);
		if(p1s==p2s){
			alert('Draw.');
		}
		else{
			var winner = (p1s>p2s ? 1 : 2);
			alert('The winner is Player '+winner+'!');
		}
	}
	
	//Start the game over prompt
	Game.prototype.restart = function(){
		if(confirm('Start a new game?')){
			new_game();
		}
	}
	
	//Player switcher
	Game.prototype.player_switch = function(){
		var p1 = id('player_1'),
			p2 = id('player_2');
		
		if(p1.className == 'active'){
			p1.className = '';
			p2.className = 'active';
			alert('Player 2 - get ready');
		}
		else if(p2.className == 'active'){
			p2.className = '';
			p1.className = 'active';
			alert('Player 1 - get ready');
		}
		else{
			p2.className = '';
			p1.className = 'active';
		}
	}
		
	
	//Deck module

	function Deck (gameInstance){
		this.game_instance = gameInstance;
		this.set = new Array;
		for(var s=0; s<4; s++){
			for(var w=0; w<13; w++){
				var card = new this.Card(s, w, gameInstance); 
				this.set.push(card);
			}
		}
		return this;
	}

	Deck.prototype.shuffle = function(){
		var d = this.set;
		for(var j, x, i = d.length; i; j = parseInt(Math.random() * i), x = d[--i], d[i] = d[j], d[j] = x);
		return d;
	};

	Deck.prototype.cut = function(){
		this.set.length = this.game_instance.deck_size;
	};

	Deck.prototype.double_set = function(){
		var l = this.set.length;
		for(var i=0; i<l; i++){
			var t = this.set[i];
			this.set[i+l] = new this.Card(t.suite, t.weight, this.game_instance);
		}
	};

	Deck.prototype.deal = function(pa){
		var obj = id(pa);
		obj.innerHTML = '';
		for(var i in this.set){
			var node = this.set[i].create_node();
			obj.appendChild(node);
		}
	};
		
	
	//Card module

	function Card (s, w, gameInstance){
		this.game_instance = gameInstance;
		this.suite = s;
		this.weight = w;
		this.flipped = false;
		this.done = false;
		return this;
	}

	Card.prototype.card_width = 72;
	
	Card.prototype.card_height = 96;
	
	Card.prototype.create_node = function(){
		var obj = ce('figure');
		obj.onclick = this.flip;
		obj.className = 'card';
		obj.style.height = this.card_height+'px';
		obj.style.width = this.card_width+'px';
		var front = ce('div');
		front.className = 'front';
		front.style.backgroundPosition = ('-'+this.weight*this.card_width+'px -'+this.suite*this.card_height+'px');
		front.style.height = this.card_height+'px';
		front.style.width = this.card_width+'px';
		var back = ce('div');
		back.className = 'back';
		back.style.height = this.card_height+'px';
		back.style.width = this.card_width+'px';
		obj.appendChild(front);
		obj.appendChild(back);
		this.node = obj;
		this.node.obj = this;
		return obj;
	}

	Card.prototype.flip = function(){
		var obj = this.obj,
			set = obj.game_instance.deck.set;
			
		if(!obj.flipped){
			obj.flipped = true;
			this.className += ' flip';
			
			//Card state checks
			var opn_cards = new Array;
			for(var i in set){
				if(set[i].flipped){
					opn_cards.push(set[i]);
				}
			}
			if(opn_cards.length == 2){
				if(opn_cards[0].suite == opn_cards[1].suite && opn_cards[0].weight == opn_cards[1].weight){
					//Guess
					for(var i=0; i<2; i++){
						opn_cards[i].done = true;
						opn_cards[i].node.className = opn_cards[i].node.className.replace('flip', 'done');
						opn_cards[i].node.onclick = function(){};
					}
					obj.game_instance.add_score();
				}
				else{
					//Guess not
					setTimeout(obj.game_instance.player_switch, 500);
				}
			}
			else if(opn_cards.length == 3){
				for(var i=0; i<3; i++){
					if(opn_cards[i].node !== this){
						opn_cards[i].flipped = false;
						opn_cards[i].node.className = opn_cards[i].node.className.replace(' flip', '');
					}
				}
			}
			//Game state check
			var done_cards = new Array;
			for(var i in set){
				if(set[i].done){
					done_cards.push(set[i]);
				}
			}
			if(done_cards.length == set.length){
				//Game over
				setTimeout(function(){
					obj.game_instance.announce_winner();
					obj.game_instance.restart();
				}, 500);
			}
		}
	}
	
	
	//Register modules
	
	Deck.prototype.Card = Card;
	Game.prototype.Deck = Deck;
	
	
	//Entry point
	
	window.onload = new_game;
	function new_game(){
		//Number of unique cards up to 52, has to be even
		var game = new Game('game_field', 9);
		game.init();
		console.log(game);
	}
})()