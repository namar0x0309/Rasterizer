/*--OBJECT: Color----------------------------------*/
function Color4() {
	return [0, 0, 0, 1];
}

function Vec4() {
	return [0, 0, 0, 0];
}

function Vec3() {
	return [0, 0, 0];
}

function Vec2() {
	return [0, 0, 0];
}

function Line3() {
	return [0, 0, 0];
}

/*--OBJECT: Queue-------------------------------------------------------------*/
function Queue() {
	var _cnt = 0;
	var _data = [];
	
	this.Enqueue = function (element) {
		_data[_cnt] = element;
		_cnt++;
	}
	
	this.Dequeue = function () {
		if (_cnt == 0)
			return;
		_cnt--;
		var ret = _data[0];
		_data.splice(0, 1); // remove first element
		return ret;
	}
	
	this.toString = function () {
		var str = "";
		for (var i = 0; i < _cnt; i++) {
			str += _data[i].toString();
			if (i < (_cnt - 1))
				str += ","
		}
		return str;
	}
	
	this.isEmpty = function () {
		return (_cnt == 0)
	}
	
}
/*--OBJECT: Queue-------------------------------------------------------------*/
