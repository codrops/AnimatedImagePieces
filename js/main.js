/**
 * pieces.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	// Helper vars and functions.
	const is3DBuggy = navigator.userAgent.indexOf('Firefox') > 0;

	// From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	// from http://www.quirksmode.org/js/events_properties.html#position
	const getMousePos = (e) => {
		let posx = 0;
		let posy = 0;
		if (!e) {let e = window.event};
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		return {
			x : posx,
			y : posy
		};
	}

	class Pieces {
		constructor(el, options) {
			this.DOM = {};
			this.DOM.el = el;
			this.options = {
				// Number of pieces / Layout (rows x cols).
				pieces: {rows: 12, columns: 10},
				hasTilt: false,
				// Main image tilt: max and min angles.
				tilt: {maxRotationX: -2, maxRotationY: 2, maxTranslationX: 4, maxTranslationY: -2},
				delay: 0, // Number || Array(random number from [min,max], e.g. [0,300] would set a random delay per piece from 0 to 300)
				// background image src.
				bgimage: 'none',
				// default animations:
				animationDefaults: {
					duration: 600,
					easing: [0.2,1,0.3,1],
					delay: (t,i) => {
						return i*parseInt(t.dataset.delay);
					},
					translateX: (t,i) => { 
						return t.dataset.column < this.getTotalColumns()/2 ? anime.random(50,100)+'px' : anime.random(-100,-50)+'px';
					},
					translateY: (t,i) => { 
						return anime.random(-1000,-800)+'px';
					},
					opacity: {
						value: 0,
						duration: 600,
						easing: 'linear'
					}
				}
			};
			Object.assign(this.options, options);
			this.init();
		}
		init() {
			// Window sizes.
			this.win = {width: window.innerWidth, height: window.innerHeight};
			// Container sizes.
			this.dimensions = {width: this.DOM.el.offsetWidth, height: this.DOM.el.offsetHeight};
			// Render all the pieces defined in the options.
			this.layout();
			// Init tilt.
			if ( this.options.hasTilt ) {
				this.initTilt();
			}
			// Init/Bind events
			this.initEvents();
		}
		layout() {
			// The source of the main image.
			this.imgsrc = this.DOM.el.style.backgroundImage.replace('url(','').replace(')','').replace(/\"/gi, "");
			// The background image.
			this.DOM.el.style.backgroundImage = this.options.bgimage !== 'none' ? `url(${this.options.bgimage})` : 'none';
			// Create the pieces and add them to the DOM (append it to the main element).
			this.pieces = [];
			for (let r = 0; r < this.options.pieces.rows; r++) {
				for (let c = 0; c < this.options.pieces.columns; c++) {
					const piece = this.createPiece(r,c);	
					piece.style.backgroundPosition = `${-1*c*100}% ${-1*100*r}%`;
					this.pieces.push(piece);
				}
			}
		}
		createPiece(row, column) {
			const w = Math.round(this.dimensions.width/this.options.pieces.columns);
			const h = Math.round(this.dimensions.height/this.options.pieces.rows);
			const piece = document.createElement('div');

			piece.style.backgroundImage = `url(${this.imgsrc})`;
			piece.className = 'piece';
			piece.style.width = `${w}px`;
			piece.style.height = `${h}px`;
			piece.style.backgroundSize = `${w*this.options.pieces.columns+4}px auto`;
			piece.dataset.row = row;
			piece.dataset.column = column;
			piece.dataset.delay = this.options.delay instanceof Array ? anime.random(this.options.delay[0],this.options.delay[1]) : this.options.delay;
			this.DOM.el.appendChild(piece);
			this.DOM.el.style.width = `${w*this.options.pieces.columns}px`;
			this.DOM.el.style.height = `${h*this.options.pieces.rows}px`;

			return piece;
		}
		// Set the pieces background image.
		setImage(imgsrc) {
			this.imgsrc = imgsrc;
			for(const piece of this.pieces) {
				piece.style.backgroundImage = `url(${this.imgsrc})`;
			}
		}
		initTilt() {
			if ( is3DBuggy ) return;
			this.DOM.el.style.transition = 'transform 0.2s ease-out';
			this.tilt = true;
		}
		removeTilt() {
			if ( is3DBuggy ) return;
			this.tilt = false;
		}
		initEvents() {
			// Mousemove event / Tilt functionality.
			const onMouseMoveFn = (ev) => {
				requestAnimationFrame(() => {
					if ( !this.tilt ) {
						if ( is3DBuggy ) {
							this.DOM.el.style.transform = 'none';
						}
						return false;
					}
					const mousepos = getMousePos(ev);
					const docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop};
					const mouseposScroll = { x : mousepos.x - docScrolls.left, y : mousepos.y - docScrolls.top };
					const rotX = 2*this.options.tilt.maxRotationX/this.win.height*mouseposScroll.y - this.options.tilt.maxRotationX;
					const rotY = 2*this.options.tilt.maxRotationY/this.win.width*mouseposScroll.x - this.options.tilt.maxRotationY;
					const transX = 2*this.options.tilt.maxTranslationX/this.win.width*mouseposScroll.x - this.options.tilt.maxTranslationX;
					const transY = 2*this.options.tilt.maxTranslationY/this.win.height*mouseposScroll.y - this.options.tilt.maxTranslationY;

					this.DOM.el.style.transform = `perspective(1000px) translate3d(${transX}px, ${transY}px,0) rotate3d(1,0,0,${rotX}deg) rotate3d(0,1,0,${rotY}deg)`;
				});
			};

			// Window resize.
			const onResizeFn = debounce(() => {
				this.win = {width: window.innerWidth, height: window.innerHeight};
				this.DOM.el.style.width = this.DOM.el.style.height = '';
				const elBounds = this.DOM.el.getBoundingClientRect();
				this.dimensions = {width: elBounds.width, height: elBounds.height};
				for (let i = 0, len = this.pieces.length; i < len; i++) {
					const w = Math.round(this.dimensions.width/this.options.pieces.columns);
					const h = Math.round(this.dimensions.height/this.options.pieces.rows);
					const piece = this.pieces[i];
					
					piece.style.width = `${w}px`;
					piece.style.height = `${h}px`;
					piece.style.backgroundSize = `${w*this.options.pieces.columns+4}px auto`;
					this.DOM.el.style.width = `${w*this.options.pieces.columns}px`;
					this.DOM.el.style.height = `${h*this.options.pieces.rows}px`;
				}
			}, 20);

			document.addEventListener('mousemove', onMouseMoveFn);
			window.addEventListener('resize', (ev) => onResizeFn());
		}
		getTotalRows() {
			return this.options.pieces.rows;
		}
		getTotalColumns() {
			return this.options.pieces.columns;
		}
		animate(animeopts) {
			animeopts = animeopts || this.options.animationDefaults;
			let opts = {
				targets: this.pieces
			};
			Object.assign(opts, animeopts);
			anime.remove(this.pieces);
			anime(opts);
		}
	};
	window.Pieces = Pieces;
};