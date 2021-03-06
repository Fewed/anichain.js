;
//---------------------------------------------------------------------------------------
// utility features

// smart selector
let sel = (target, mode = 0) => {
	let arr = document.querySelectorAll(target);
	
	return (arr.length !== 1) ? [...arr] : ((mode !== 0) ? [arr[0]] : arr[0]);
};

// global event listener
let lis = (eventType, process) => window.addEventListener(eventType, process);

// shorted console.log()
let log = console.log.bind(console);

// shorted requestAnimationFrame
let raf = cb => requestAnimationFrame(cb);

// shorted cancelAnimationFrame
let caf = cb => cancelAnimationFrame(cb);

// shorted getComputedStyle
let gs = element => getComputedStyle(element);

//-------------------------------------------------------------------------------------
// main features

function CreateAnimatedObject(element) {
	Object.defineProperties(this, {
		x: {
			get: () => parseInt(gs(element).left),
			set: num => element.style.left = `${num}px`
		},
		y: {
			get: () => parseInt(gs(element).top),
			set: num => element.style.top = `${num}px`
		},
		angle: {
			get: () => {
				let matrix = gs(element).transform;

				if (matrix != "none") {
					matrix = matrix.split("(")[1].split(")")[0].split(", ");
					return Math.round(Math.atan2(+matrix[1], +matrix[0]) * (180/Math.PI));
				}
				else return 0;
			},
			set: num => element.style.transform = `rotate(${angle}deg)`
		},
		src: {get: () => element},
		w: {
			get: () => parseInt(gs(element).width),
			set: num => element.style.width = `${num}px`
		},
		h: {
			get: () => parseInt(gs(element).height),
			set: num => element.style.height = `${num}px`
		},
		bgc: {
			get: () => gs(element).backgroundColor,
			set: val => element.style.backgroundColor = val
		},
		display: {
			get: () => gs(element).display,
			set: val => element.style.display = val
		},
	});

	this.t = 0;

	this.asyncWrap = (action, args, condition) => {
		return new Promise(resolve => {
			let loop = () => {
				if (condition()) {
					action(...args());
					raf(loop);
				}
				else {
					this.t = 0;
					resolve();
				}
			};
			loop();
		});
	};
}


function init(selector, num = -1) {
	let elements = (num !== -1) ? sel(selector)[num] : sel(selector);
	if (elements.length === undefined) return new CreateAnimatedObject(elements);
	else return elements.map(item => new CreateAnimatedObject(item));
};

async function chain(...arr) {
	for (let i = 0; i < arr.length-1; i++) {
		let [pos, obj, fun, arg, con] = arr[i];

		if (arr[i][0] === arr[i+1][0]) obj.asyncWrap(fun.bind(obj), arg, con.bind(obj));
		else {
			await obj.asyncWrap(fun.bind(obj), arg, con.bind(obj));
			arr[i][0] = arr[i+1][0];
		}
	}

	if (typeof(arr[arr.length-1]) === "object") {
		let [pos, obj, fun, arg, con] = arr[arr.length-1];

		obj.asyncWrap(fun.bind(obj), arg, con.bind(obj));
	}
	else (arr[arr.length-1])();
}

function createAnimEl(className, parNode = null) {
	let temp = document.createElement("div");
	(parNode === null) ? document.documentElement.appendChild(temp) : parNode.appendChild(temp);
	temp.classList.add(className);
	return init(`.${className}`);
}

function removeAnimEl(className) {
	sel(`.${className}`).remove();
	return null;
}