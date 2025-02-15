if( !MeshLibrary ) 
	var MeshLibrary = {};
MeshLibrary.Cube = function() {
var mesh = new Mesh3D();
mesh.name = "Cube";
mesh.vertices = [[-1.00,-1.00,1.00,1],[-1.00,1.00,1.00,1],[-1.00,-1.00,-1.00,1],[-1.00,1.00,-1.00,1],[1.00,-1.00,1.00,1],[1.00,1.00,1.00,1],[1.00,-1.00,-1.00,1],[1.00,1.00,-1.00,1]];
mesh.vcolor = [[255,0,0,255],[255,0,0,255],[255,0,0,255],[255,0,0,255],[255,0,0,255],[255,0,0,255],[255,0,0,255],[255,0,0,255]];
mesh.vnormals = [[-0.58,-0.58,0.58,1],[-0.67,0.33,0.67,1],[-0.58,-0.58,-0.58,1],[-0.41,0.82,-0.41,1],[0.33,-0.67,0.67,1],[0.67,0.67,0.33,1],[0.82,-0.41,-0.41,1],[0.41,0.41,-0.82,1]];
mesh.normals = [[0.00,1.00,0.00,1],[0.00,1.00,0.00,1],[-1.00,0.00,-0.00,1],[-1.00,0.00,-0.00,1],[-0.00,-1.00,-0.00,1],[-0.00,-1.00,0.00,1],[1.00,0.00,-0.00,1],[1.00,-0.00,0.00,1],[-0.00,-0.00,1.00,1],[0.00,-0.00,1.00,1],[0.00,0.00,-1.00,1],[0.00,-0.00,-1.00,1]];
mesh.triangles = [[3,5,7],[1,3,5],[0,1,2],[1,2,3],[2,4,6],[0,2,4],[5,6,7],[4,5,6],[1,4,5],[0,1,4],[2,6,7],[2,3,7]];
return mesh;
};