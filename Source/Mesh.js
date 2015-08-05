Mesh3D = function () {
    // Transform
    var _transform = new Transform3D();
    this.transform = _transform;

    // Mesh Information
    var _vertices = []; 							// Vertices
	var _vnormals = [];								// Vertex Normals
    var _vcolor = []; 								// Vertex rgba
    var _triangles = []; 							// Index into vertices
	var _normals = [];								// Normals
	
    this.vertices = _vertices;
	this.vnormals = _vnormals;
    this.triangles = _triangles;
    this.vcolor = _vcolor;
	this.normals = _normals;
	
    this.VertexAdd = function (p) {
        _vertices.push(new Vertex3(p));
    }

	this.VertexNormalAdd = function(vertId) {
		_vnormals.push(new VertexNormal(vertID));
	}
	
    this.ColorAdd = function (c) {
        _vcolor.push([c[0], c[1], c[2], c[3]]);
    }

    this.TriangleAdd = function (ind3) {
        _triangles.push(new Triangle(ind3));
    }
	
	this.NormalAdd = function (triID) {
		_normals.push(new Normal(triID));
	}
}

function Polygon() {

}

function Triangle(ind3) {
    return [ind3[0], ind3[1], ind3[2]];
}

function Edge(ind2) {
    return [ind2[0], ind2[1]];
}

function Vertex3(p) {
    return [p[0], p[1], p[2]];
}

function Normal(triID) {
	return triID;
}


