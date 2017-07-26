{
	const paterEl = document.querySelector('.pater');
	const paterPiecesEl = paterEl.querySelector('.pieces');
	const paterObj = new Pieces(paterPiecesEl, {
		delay: [0,30],
		bgimage: paterPiecesEl.dataset.imageAlt
	});
	const paterOut = () => paterObj.animate({
		duration: 200,
		easing: 'easeOutQuad',
		delay: (t,i,l) => {
			return parseInt(t.dataset.row) * parseInt(t.dataset.delay);
		},
		translateX: (t,i) => {
			return anime.random(-50,50)+'px';
		},
		translateY: (t,i) => { 
			return anime.random(-800,-200)+'px';
		},
		opacity: 0
	});
	const paterIn = () => paterObj.animate({
		duration: 200,
		easing: 'easeOutQuad',
		delay: (t,i,l) => {
			return parseInt(t.dataset.row) * parseInt(t.dataset.delay);
		},
		translateX: 0,
		translateY: 0,
		opacity: 1
	});
	paterEl.addEventListener('mouseenter', ev => paterOut());
	paterEl.addEventListener('touchstart', ev => paterOut());
	paterEl.addEventListener('mouseleave', ev => paterIn());
	paterEl.addEventListener('touchend', ev => paterIn());
}