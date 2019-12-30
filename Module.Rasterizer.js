/*!
	Copyright Nassim Amar 2012
	Free For Personal Use
	Contact Author for Commercial Usage
	Thanks!
*/
Camera = function () {	
    this.fov = 0;
	this.aspect = 0;
	this.znear = 0;
	this.zfar = 0;
	
	// Near/Far Planes
	var _width = 0, _height = 0, _depth = 0;
	var _FrustumPlanes =[ [ 0, 0, 0, 0 ], 		// Right
						  [ 0, 0, 0, 0 ],		// Left
					      [ 0, 0, 0, 0 ], 		// Bottom
						  [ 0, 0, 0, 0 ], 		// Top
						  [ 0, 0, 0, 0 ],		// Far
						  [ 0, 0, 0, 0 ]		// Near
						]; 
	this.matProj = [];
	var _zAddZFarZNear = 0;
	var _isFrustumUpdateNeeded = false; 
	
	this.loc = [ 0, 0, 0 ];
	var _target = [ 0, 0, 0 ],
		_right = [ 0, 0, 0 ],
		_up = [ 0, 0, 0 ],
		_dir = [ 0, 0, 0 ];
		_locNeg = [ 0, 0, 0 ];
		
	this.mat = [ 0 ];
	this.matInv = [ 0 ];
	
	this.Parameters = function( width, height, znear, zfar, fovRadian ) {
		this.fov = fovRadian;
		this.aspect = width / height; 
		this.znear = znear; 
		this.zfar = zfar; 
		
		this.ProjectionCalculate(); 		
	}

    // Initialization
	this.LookAt = function( loc, target ) {
		_target = [ target[0], target[1], target[2] ];
		
		this.loc = [ loc[0], loc[1], loc[2] ];
									 
		_dir = Math.Vector._3D.Normal( [ target[0] - this.loc[0], 
									     target[1] - this.loc[1],
									     target[2] - this.loc[2] ] );
		
		// DotProduct( [ 0, 1, 0 ], dir ) is dir[1]. Up - (dotProd * dir )
		// will give us correct up vector
		_up = Math.Vector._3D.Normal( [ -_dir[0] * _dir[1],
										1 -_dir[1] * _dir[1],
										-_dir[2] * _dir[1] ] );
				
		_right = Math.Vector._3D.Normal( Math.Vector._3D.CrossProduct( _up , _dir ) );
		
		_locNeg = [ -this.loc[0],  -this.loc[1],  -this.loc[2] ];
		
		this.matInv = [ _right[0], _up[0], _dir[0], Math.Vector._3D.DotProduct( _right, _locNeg ),
						_right[1], _up[1], _dir[1], Math.Vector._3D.DotProduct( _up, _locNeg ),
						_right[2], _up[2], _dir[2], Math.Vector._3D.DotProduct( _dir, _locNeg ),
						0,		 0, 	 0, 				1  ];
		_isFrustumUpdateNeeded = true; 					 
	}
	
	this.Move = function( vel, dir ) {
		_target = [ dir[0], dir[1], dir[2] ];
				
		_dir = Math.Vector._3D.Normal( [ dir[0], dir[1], dir[2] ] );
		
		// DotProduct( [ 0, 1, 0 ], dir ) is dir[1]. Up - (dotProd * dir )
		// will give us correct up vector
		_up = Math.Vector._3D.Normal( [ -_dir[0] * _dir[1],
										1 -_dir[1] * _dir[1],
										-_dir[2] * _dir[1] ] );
				
		_right = Math.Vector._3D.Normal( Math.Vector._3D.CrossProduct( _up , _dir ) );
		
		this.loc = [ this.loc[0] + _dir[0] * vel[0], 
					 this.loc[1] + _dir[1] * vel[1],
					 this.loc[2] + _dir[2] * vel[2] ];
				 					 
		_locNeg = [ -this.loc[0],  -this.loc[1],  -this.loc[2] ];
		
		this.matInv = [ _right[0], _up[0], _dir[0], Math.Vector._3D.DotProduct( _right, _locNeg ),
						_right[1], _up[1], _dir[1], Math.Vector._3D.DotProduct( _up, _locNeg ),
						_right[2], _up[2], _dir[2], Math.Vector._3D.DotProduct( _dir, _locNeg ),
						0,		 0, 	 0, 				1  ];
		_isFrustumUpdateNeeded = true;				
	}
	
	this.PointInFrustum = function( point ) {
		// Preleminary test
		//if( point[2] > this.zfar || point[2] < this.znear )
		//	return false; 
			
		if( _isFrustumUpdateNeeded ) this.FrustumCalculate(); 
		
		for( var i = 0; i < 6; ++i ) {
			if( Math.Geometry.Plane3D.DistanceToPoint( _FrustumPlanes[i], point ) <= 0 ) 
				return false; 
		}
	
		return true; 
	}
	
	
	this.ProjectionCalculate = function() {
		var xymax = this.znear * Math.tan( this.fov ),
			ymin = -xymax,
			xmin = -xymax;
			
		_width = xymax - xmin; 
		_height = xymax - ymin; 
		_depth = this.zfar - this.znear; 
		
		var w = 2 * this.znear / _width; 
		w = w / this.aspect; 
		var h = 2 * this.znear / _height;
		
		// precalculate
		_zAddZFarZNear = this.zfar + this.znear;	
		
		this.matProj = [ w, 0, 0, 0 ,
						 0, h, 0, 0 , 
						 0, 0, -_zAddZFarZNear / _depth, ( -2 * this.zfar * this.znear ) / _depth , 
						 0, 0, -1, 0 ];
	}
	
	this.FrustumCalculate = function() {		
		var _matClip = Mat4x4.Multiply( this.matProj, this.matInv );
		
		// Planes calculations http://www.racer.nl/reference/vfc_markmorley.htm
		// original author: Mark Moley
		// RIGHT
		_FrustumPlanes[0] = [ _matClip[3] - _matClip[0], 
							  _matClip[7] - _matClip[4],
							  _matClip[11] - _matClip[8],
							  _matClip[15] - _matClip[12] ];
		_FrustumPlanes[0] = Math.Vector._4D.Normal( _FrustumPlanes[0] ); 
		
		// LEFT
		_FrustumPlanes[1] = [ _matClip[3] + _matClip[0], 
							  _matClip[7] + _matClip[4],
							  _matClip[11] + _matClip[8],
							  _matClip[15] + _matClip[12] ];
		_FrustumPlanes[1] = Math.Vector._4D.Normal( _FrustumPlanes[1] ); 
		
		// BOTTOM
		_FrustumPlanes[2] = [ _matClip[3] + _matClip[1], 
							  _matClip[7] + _matClip[5],
							  _matClip[11] + _matClip[9],
							  _matClip[15] + _matClip[13] ];
		_FrustumPlanes[2] = Math.Vector._4D.Normal( _FrustumPlanes[2] ); 
		
		// TOP
		_FrustumPlanes[3] = [ _matClip[3] - _matClip[1], 
							  _matClip[7] - _matClip[5],
							  _matClip[11] - _matClip[9],
							  _matClip[15] - _matClip[13] ];
		_FrustumPlanes[3] = Math.Vector._4D.Normal( _FrustumPlanes[3] ); 
		
		// FAR
		_FrustumPlanes[4] = [ _matClip[3] - _matClip[2], 
							  _matClip[7] - _matClip[6],
							  _matClip[11] - _matClip[10],
							  _matClip[15] - _matClip[14] ];
		_FrustumPlanes[4] = Math.Vector._4D.Normal( _FrustumPlanes[4] ); 
		
		// NEAR
		_FrustumPlanes[5] = [ _matClip[3] + _matClip[2], 
							  _matClip[7] + _matClip[6],
							  _matClip[11] + _matClip[10],
							  _matClip[15] + _matClip[14] ];
		_FrustumPlanes[5] = Math.Vector._4D.Normal( _FrustumPlanes[5] ); 
	
		
		_isFrustumUpdateNeeded = false; 
	}
}


/*--GLOBALS----------------------------------------*/
var GLOBAL = { 
        WIDTH: 800,
        HEIGHT: 500,
        FPSFILTER: 60 
    }
    
var contextCanvas = null;

if( !MeshLibrary ) 
    var MeshLibrary = {};
/*--GLOBALS----------------------------------------*/

/*--OBJECT: Canvas------------------------------------------------------------*/
function ContextCanvas(canvasName) {
    // DEFINES
     var R = 0, G = 1, B = 2, A = 3;
     var X = 0, Y = 1, Z = 2, W = 3;
     var STATE = {
         NONE: -1,
         RENDER: {
             LINE: 0,
             VERTEX: 1,
             POLYGON: 3,
             CULLING: 4
         },
         DEBUG: {
             VERTEXNUMBERS: 2
         }
     };
     this.STATE = STATE; 
 
    // Class members
    var _canvas = document.getElementById(canvasName);
    var _ctx2D = _canvas.getContext('2d');
    var _width = _canvas.width;
    var _height = _canvas.height;
    var _image = 0;                              // Image object
    var _buffer = 0;                             // Drawing surface
    var _fps = 0, _lastUpdate = new Date, _fpsmsecond = ( 1 / GLOBAL.FPSFILTER ) * 1000;		 // FPS counting
    
    // View information
    var _camera = new Camera();
    _camera.Parameters( _width, _height, 1, 1000, 1.6 );
    this.camera = _camera; 

    // Color 
    var _color = new Color4();
    var _colorclear = new Color4(); 
    
    // Text
    var _queueText = [];  

    // Mouse
    var _mouse2d = [ 0, 0 ]; 
    this.mouse2d = _mouse2d; 
    
    // Space
    var _space = new SpaceMat4x4(); 
    this.space = _space;
    
    // States
    var _state = {
        render: { brush: STATE.RENDER.LINE, culling: true },
        point: { size : 1},
        debug: {vertexnumbers: false }		
    };
    this.state = _state; 
    /*--State Mgmt Functions--------------------------------------------------*/
    this.Enable = function( state ) {
        switch( state ) {
            case STATE.RENDER.CULLING:
                _state.render.culling = true; 
            break;
            case STATE.RENDER.POLYGON:
            case STATE.RENDER.LINE:
            case STATE.RENDER.VERTEX:
                _state.render.brush = state; 
            break; 
          
            case STATE.DEBUG.VERTEXNUMBERS:
                _state.debug.vertexnumbers = true; 
            break; 
            default:
                console.log( "ContextCanvas.Enable: State Not Recognized" );
            break; 
        }
    }
    
    this.Disable = function( state ) {
        switch( state ) {
            case STATE.RENDER.CULLING:
                _state.render.culling = false; 
            break;
            case STATE.RENDER.POLYGON:
            case STATE.RENDER.LINE:
            case STATE.RENDER.VERTEX:
                _state.render.brush = STATE.NONE; 
            break; 
            case STATE.DEBUG.VERTEXNUMBERS:
                _state.debug.vertexnumbers = false; 
            break;
            default:
                console.log( "ContextCanvas.Disable: State Not Recognized" );
            break; 
        }
    }
    /*--3D Mesh Functions-----------------------------------------------------*/
    
    // Type Vertex2D for drawing
    function Vertex2D() {
        this.vertices = [];
        this.vcolor = null; 
        this.tris = null;
    }
    
    this.Draw3DMesh = function( mesh ) {
    
        // Preleminary test.
        // TODO: Vertex should be replaced by one intersecting Frustum plane
        /*
        for( var j = 0; j < 3; ++j )
            if( !_camera.PointInFrustum( mesh.vertices[tris[j]] ) )
                return false; 
        */
        
        var meshTemp = Transform3DMesh(mesh); 
            
        // Get 2D points
        var v2d = new Vertex2D();
        v2d.vcolor = ( meshTemp.vertices.length == meshTemp.vcolor.length ) ? [] : null;  
        v2d.tris = ( meshTemp.triangles ) ? [] : null;
        
        var vertIdMapping = {};
        for( var i = 0; i < meshTemp.triangles.length; i++ ) {
            
            // Skip triangle if not facing camera
            if( _state.render.culling && 
                !this.IsTriangleVisible3D(meshTemp, meshTemp.triangles[i], meshTemp.normals[i])) 
                continue;
                
                // Add vertices and vertex colors
                for( var j = 0; j < 3; j++ ) {
                    // Only insert new vertices
                    if( vertIdMapping[  meshTemp.triangles[i][j] ] == null ) {
                        v2d.vertices.push( Transform3DTo2D( meshTemp.vertices[ meshTemp.triangles[i][j] ] ) ); 
                        vertIdMapping[ meshTemp.triangles[i][j] ] = v2d.vertices.length - 1; 
                    
                        if( v2d.vcolor ) {
                            // Color Fading into distance
                            var dist = ( -meshTemp.vertices[meshTemp.triangles[i][j]][Z] ) / _camera.zfar; 
                            
                            // Clamping
                            if( dist < 0.2 ) dist = 0.2; 
                            else if( dist > .8 ) dist = .8;
                            dist = 1 - dist; 
                            
                            v2d.vcolor.push( 
                                [ meshTemp.vcolor[meshTemp.triangles[i][j]][R] * dist,
                                  meshTemp.vcolor[meshTemp.triangles[i][j]][G] * dist,
                                  meshTemp.vcolor[meshTemp.triangles[i][j]][B] * dist,
                                  meshTemp.vcolor[meshTemp.triangles[i][j]][A] * dist ] );			
                        }
                    }
                }
                
                // Push the mapped vertices to be rendered
                v2d.tris.push( [ vertIdMapping[ meshTemp.triangles[i][0] ], 
                                 vertIdMapping[ meshTemp.triangles[i][1] ],
                                 vertIdMapping[ meshTemp.triangles[i][2] ]] ); 
        }
        
        // Sort Points left to right
        for( var i = 0; i < v2d.tris.length; i++ ) {
            for( var j = 0; j < 3; j++ ) {
                var minXID = j;
                for( var k = j + 1; k < 2; k++ ) {
                    if( v2d.vertices[v2d.tris[i][k]][X] < 
                        v2d.vertices[v2d.tris[i][minXID]][X] ) {
                            minXID = k; 
                        }
                }
                // Swap
                if( minXID != j ) {
                    v2d.tris[i][j] = v2d.tris[i][minXID] - v2d.tris[i][j];
                    v2d.tris[i][minXID] = v2d.tris[i][minXID] - v2d.tris[i][j]; 
                    v2d.tris[i][j] = v2d.tris[i][minXID] + v2d.tris[i][j]; 
                }
            }
        }               
                
        // Final Render to drawing surface
        switch( _state.render.brush ) {
            case STATE.RENDER.LINE: 
                this.DrawVertex2DLine( v2d ); 
            break;
            
            case STATE.RENDER.POLYGON:
                this.DrawVertex2DFill( v2d );
            break;

            case STATE.RENDER.VERTEX:
                for(var i = 0; i < v2d.vertices.length; i++) {
                    this.PlotRect2D( v2d.vertices[i], ( v2d.vcolor ? v2d.vcolor[i] : null ), 4 );
                    //this.PlotPixel2D( v2d.vertices[i], ( v2d.vcolor ? v2d.vcolor[i] : null ) ); 
                    if( this.state.debug.vertexnumbers )
                        this.Print2D( i , v2d.vertices[i] );
                }
                
            break;           
        }
    }
    
    function Transform3DMesh( mesh ) {
        var meshTransformed = mesh.clone();	
        
        meshTransformed.transform.BindToMatrix();
        var matSpace = Mat4x4.Multiply( meshTransformed.transform.MatrixGet(), _camera.matInv);
        
        
        // Transforming Normals
        var matInvTransp = Mat4x4.Transpose(_camera.matInv); 
        for( var i = 0; i < mesh.normals.lenght; i++ ) {
            meshTransformed.normals[i] = Mat4x4.TransformPoint( meshTransformed.normals[i], matInvTransp );
        }
            
        // Transforming Vertices
        for( var i = 0; i < mesh.vertices.length; i++ ) {
            meshTransformed.vertices[i] = Mat4x4.TransformPoint( meshTransformed.vertices[i], matSpace );
        }								  
                  
        // For culling later
        meshTransformed.transform.setLoc(  [
                                  meshTransformed.transform.loc[0] - _camera.loc[0], 
                                  meshTransformed.transform.loc[1] - _camera.loc[1], 
                                  meshTransformed.transform.loc[2] - _camera.loc[2] ] );
                                  
                                  
        return meshTransformed; 
    }
    
    function Transform3DTo2D(point) {

        // TODO: Rebuild mesh against view frustrum
        // Clamp to znear / zfar
        /*
        if( point[Z] < _camera.znear )
            point[Z] = _camera.znear 
        else if ( point[Z] > _camera.zfar )
            point[Z] = _camera.zfar;
        */
        
        var p = [ 0, 0 ];
        p = Mat4x4.TransformPoint( point, _camera.matProj );		
        //console.log( p.toString() );
        
        //var z = point[Z] / ( _camera.zfar - _camera.znear );
        //p = [ point[X] / z, point[Y] / z ];
        
        p[X] = (p[X] + .5 ) * _width;// * .5; 
        p[Y] = (p[Y] + .5 ) * _height;// * .5; 		
        
        return p; 
    }
    
    /*--Getter/Setters--------------------------------------------------------*/
    this.getWidth = function() {
        return _width; 
    }
    this.getHeight = function() {
        return _height; 
    }
    this.getFPS = function() {
        return _fps; 
    }
    
    /*--Display Buffer Functions----------------------------------------------*/
    this.Clear = function() {
        _ctx2D.clearRect(0, 0, _width, _height);
    }

    this.DrawingSurfaceAlloc = function() {
        _image = _ctx2D.createImageData(_width, _height);
        _buffer = _image.data;
    }

    this.DrawingSurfaceGet = function() {
        _image = _ctx2D.getImageData(0, 0, _width, _height);
        _buffer = _image.data;
        this.DimensionsUpdate(); 
    }

    this.DrawingSurfaceDisplay = function() {
        _ctx2D.putImageData( _image, 0, 0);
        _Print2D(); 
    }
    
    this.Update = function( strFuncLoop ) {
        var thisFrameFPS = 1000 / ( (now = new Date) - _lastUpdate ); 
        var delay = (thisFrameFPS - _fps) / GLOBAL.FPSFILTER; 
        _fps += delay; 
        _lastUpdate = now ; 
        setTimeout( strFuncLoop, _fpsmsecond - delay );
    }

    this.DimensionsUpdate = function() {
        _width = _image.width;
        _height = _image.height;
    }
    
    /*--Drawing Functions 2D--------------------------------------------------*/ 
    this.PlotRect2D = function(p, color, size ) {
        if( !size ) size = 3; 
        else if( size % 2 == 0 )
            ++size;							// Adjust even number to balance square
        
        var sizeHalf = size / 2; 
        
        for( var i = -sizeHalf; i < sizeHalf; ++i )
        for( var j = -sizeHalf; j < sizeHalf; ++j )
            this.PlotPixel2D( [p[X]+j,p[Y]+i], color );
    }
    
    this.PlotPixel2D = function(p, color) {
        p[X] = Math.round( p[X] ); 
        p[Y] = Math.round( p[Y] );

        if( color ) {
            _color[R] = color[R]; 
            _color[G] = color[G]; 
            _color[B] = color[B]; 
            _color[A] = color[A]; 
        }
        
        var i = (p[Y] * _width + p[X] ) * 4;
        _buffer[i] 	   = _color[R];
        _buffer[i + 1] = _color[G];
        _buffer[i + 2] = _color[B];
        _buffer[i + 3] = _color[A];
    }
    
    //TODO: Speed function, manually setting ~circular points around p
    //		fillRect +:fast -: aliasing
    this.PlotPoint2D = function( p, color ) {
        var steps = 1 / ( Math._2PI * _state.point.size );
        for( var circ = 0; circ < Math._2PI; circ += steps ) {
        for( var rad = 0; rad < _state.point.size; rad++ ) {
            this.PlotPixel2D( [p[X] + Math.cos(circ) * rad,
                               p[Y] + Math.sin(circ) * rad], color );
        }
        }
    }
    
    // Assumptions: Points are soreted (a(n)[X] < a(n+1)[X])
    this.DrawTriangle2D = function( v2d, i ) {
        var idMinX = v2d.vertices[i[0]][X], idMaxX = v2d.vertices[i[2]][X]; 

        var idMaxY = 0, idMinY = 0;
        for( var j = 1; j < i.length; j++ ) {
            if( v2d.vertices[i[j]][Y] > v2d.vertices[i[idMaxY]][Y] )
                idMaxY = j; 
            if( v2d.vertices[i[j]][Y] < v2d.vertices[i[idMinY]][Y] )
                idMinY = j; 
        }

        idMinY = v2d.vertices[i[idMinY]][Y];
        idMaxY = v2d.vertices[i[idMaxY]][Y];
                        
        for( var j = idMinY; j < idMaxY; j++ ) {
            for( var k = idMinX; k < idMaxX; k++ ) {
                                
                if( this.IsPointInTriangle2D_Area( [ v2d.vertices[i[0]],
                                                   v2d.vertices[i[1]],
                                                   v2d.vertices[i[2]] ],
                                                   [ k , j ] ) ) {
                                              
                    this.PlotPixel2D( [ k, j ], null ); 	
                    // TODO: Interpolation
                }
            }
        }
    }
    
    this.DrawLine2D = function( v2d, i ) {
        var vecDir = Math.Vector._2D.Difference( v2d.vertices[i[1]], v2d.vertices[i[0]] );
        
        var step = 1 / Math.Vector._2D.Magnitude( vecDir );
        var colorInterp = ( v2d.vcolor ? v2d.vcolor[i[0]].clone() : null ); 
        for( var j = 0; j < 1; j += step ) {
        
            if( colorInterp ) {
                colorInterp[0] = Math.Interpolation.Linear( colorInterp[0], v2d.vcolor[i[1]][0], j );
                colorInterp[1] = Math.Interpolation.Linear( colorInterp[1], v2d.vcolor[i[1]][1], j );
                colorInterp[2] = Math.Interpolation.Linear( colorInterp[2], v2d.vcolor[i[1]][2], j );
                colorInterp[3] = Math.Interpolation.Linear( colorInterp[3], v2d.vcolor[i[1]][3], j );
            }
            this.PlotPixel2D( [ v2d.vertices[i[0]][X] + j * vecDir[X], v2d.vertices[i[0]][Y] + j * vecDir[Y] ], 
                                colorInterp );
        }
    }
    
    this.DrawVertex2DLine = function( v2d ) {
        for( var i = 0; i < v2d.tris.length; i++ ) {
            this.DrawLine2D( v2d, [ v2d.tris[i][0], v2d.tris[i][1] ] );
            this.DrawLine2D( v2d, [ v2d.tris[i][1], v2d.tris[i][2] ] );
            this.DrawLine2D( v2d, [ v2d.tris[i][2], v2d.tris[i][0] ] );
        }
    }
    
    this.DrawVertex2DFill = function( v2d ) {
        for( var i = 0; i < v2d.tris.length; i++ ) {
            this.DrawTriangle2D( v2d, [ v2d.tris[i][0], v2d.tris[i][1], v2d.tris[i][2] ] ); 
        }
    }
    
    this.Color4Set = function( r, g, b, a ) {
        _color[R] = r; 
        _color[G] = g; 
        _color[B] = b; 
        _color[A] = a; 
    }
    
    /*--Culling/Surface Removal ----------------------------------------------*/ 
    this.IsTriangleVisible3D = function(mesh,tris,normal) { 
        // DotProduct( cameraDirection, TrisNorm ); 
        if(Math.Vector._3D.DotProduct(Math.Vector._3D.Difference(_camera.loc,mesh.vertices[tris[1]]),normal) > 0 )
            return true;
        return false;
    }
    
    /*--Scanline Functions ---------------------------------------------------*/ 
    this.IsPointSameSide2D = function( p0, p1, a, b ) {
        var cp1 = Math.Vector._3D.CrossProduct( [ b[X] - a[X],
                                                  b[Y] - a[Y],
                                                   0 ],
                                                 [ p0[X] - a[X],
                                                   p0[Y] - a[Y],
                                                   0 ] );
                                                   
        var cp2 = Math.Vector._3D.CrossProduct( [ b[X] - a[X],
                                                  b[Y] - a[Y],
                                                   0 ],
                                                 [ p1[X] - a[X],
                                                   p1[Y] - a[Y],
                                                   0 ] );
                                                   
        if( Math.Vector._3D.DotProduct( cp1, cp2 ) >= 0 )
            return true; 
            
        return false; 
    }
    
    this.IsPointInTriangle2D_CrossProduct = function( triVert, point ) {
        if( this.IsPointSameSide2D( point, triVert[0], triVert[1], triVert[2] ) && 
            this.IsPointSameSide2D( point, triVert[1], triVert[0], triVert[2] ) &&
            this.IsPointSameSide2D( point, triVert[2], triVert[0], triVert[1] ) )
                return true; 
        return false; 
    }
    
        
    this.IsPointInTriangle2D_Area = function( triVert, point ) {
        
        var pab = Math.Geometry.TriangleArea2D( [ point, triVert[0], triVert[1] ] ), 
            pbc = Math.Geometry.TriangleArea2D( [ point, triVert[1], triVert[2] ] ),
            pac = Math.Geometry.TriangleArea2D( [ point, triVert[0], triVert[2] ] ),
            abc = Math.Geometry.TriangleArea2D( triVert );
        
        if( Math.abs( abc - ( pab + pbc + pac ) ) < Math.EPSILON  )
                return true; 
        return false; 
    }
    
    /*--Text Functions--------------------------------------------------------*/
    this.Print2D = function( str, pos ) {
        _queueText.push([str,pos]);
    }
    
    function _Print2D() {
        var yoffset = 10; 
        var str;
        
        _ctx2D.fillStyle = "white";
        
        while( _queueText.length != 0 ) {
            str_pos = _queueText.shift(); 
            _ctx2D.fillText( str_pos[0] , str_pos[1][X], str_pos[1][Y] );
        }
    }
}

/*--Helper Functions----------------------------------------------------------*/

function CanvasCreate( width, height, name, parentName ) {
    
    var parent = parentName? document.getElementById(parentName) : null; 

    var canvas = document.createElement('canvas');    
    canvas.setAttribute('id',name);
    canvas.setAttribute('width',width);
    canvas.setAttribute('height',height);
    
    if (parent)
        parent.appendChild(canvas);
    else 
        document.body.appendChild(canvas);
    
    IE = document.all ? true : false
    if ( !IE ) document.captureEvents(Event.MOUSEMOVE)
    document.onmousemove = onMouseMove;
    
}

// TODO: Fix cross browser loading  Not working!
function GetAsset( url ) {
    var req = new XMLHttpRequest(); 
    
    if( req.overrideMimeType ) {
        req.overrideMimeType( "text/plain; charset = x-user-defined" ); 
    }
    
    /*
    req.onreadystatechange = function() {
        if( req.readyState == 4 ) {
            if( req.status == 0 || req.status == 200 ) {
                //req.responseText;
            }
        }
    }
    */
    req.open( "GET", url, true ); 
    req.send( null ); 
}

MeshLibrary.Grid = function( size ) {
    var mesh = new Mesh3D();
    var sizehalf = size * .5; 
    var sizesquared = size * size; 
    var scale = 1; 
    
    // Vertices
    for( var i = 0; i < size; i++) {
        for( var j = 0; j < size; j++ ) {
            mesh.VertexAdd( [ ( i - sizehalf ) * scale , 0 ,( j - sizehalf ) * scale ] );
        } 
    }

    // Polygon
    for( var i = 0; i < sizesquared - 2; i = i + 3 ){
        mesh.TriangleAdd( [ j, j + 1, j + 2 ] );
    }
    
    return mesh; 
}/*!
 * Copyright Nassim Amar 2012
 */
 
/*--Utility Functions --------------------------------------------------------*/
function SwapNumbers( a, b ) {
	a = b - a;
	b = b - a; 
	a = b + a; 
}

Object.prototype.clone = function() {
    var newObj = ( this instanceof Array ) ? [] : {};
    for( i in this) {
        if( i == 'clone' ) continue; 
        if( this[i] && typeof this[i] == "object" ) {
            newObj[i] = this[i].clone(); 
        } else newObj[i] = this[i];
        } return newObj;
}

function SourceCodeInclude( src ) {
    if( document.createElement && document.getElementsByTagName ) {
        
        var head_tag = document.getElementsByTagName( 'head' )[0];
        var script_tag = document.createElement( 'script' );
        script_tag.setAttribute( 'type', 'text/javascript' );
        script_tag.setAttribute( 'src', src );
        head_tag.appendChild( script_tag );
    }
}// General
Math.EPSILON = 0.000001;
/*--Matrix 4x4 ---------------------------------------------------------------*/
function SpaceMat4x4() {
    var mStack = [];
    var m = Mat4x4.Identity();
	var mInv = Mat4x4.Identity(); 

    this.push = function (mat4x4) {
        mStack.push(m);
    }

    this.pop = function () {
        m = mStack.pop();
    }

    this.Translate = function (v3) {
        // m = Mat4x4.Multiply(m, Mat4x4.Translate(v3));
		// Optimization
		m[0][3] += v3[0];
		m[1][3] += v3[1];
		m[2][3] += v3[2];
    }

    this.Rotate = function (v3) {
        m = Mat4x4.Multiply(m, Mat4x4.Rotate(v3));
    }

    this.Scale = function (v3) {
        m = Mat4x4.Multiply(m, Mat4x4.Scale(v3));
    }

    this.IdentitySet = function () {
        m = Mat4x4.Identity();
    }

    this.DebugPrint = function () {
        console.log("Stack:");
        console.log(m.toString());
    }

    this.MatrixGet = function () {
        return m.clone();
    }

	this.MatrixInversetGet = function() {
		mInv = Mat4x4.Inverse( m ); 
		return mInv.clone();
	}
	
    this.MatrixSet = function (mIn) {
        m = mIn.clone();
    }

    this.MultiplyByMatrix = function( mIn ) {
        m = Mat4x4.Multiply( m, mIn ); 
    }
}

function Transform3D() {
    var _isTransformBinded = false;
	var _isTransformInverseBinded = false;
	
    this.loc = [ 0, 0, 0 ];
	this.rot = [ 0, 0, 0 ];
    this.scl = [ 1, 1, 1 ];
    this.dir = [ 0, 0, 1 ];

    // Homogeneous coordinates
    this.space = new SpaceMat4x4();
    this.space.IdentitySet();

    this.setLoc = function (p) {
        this.loc = [p[0], p[1], p[2]];
        _isTransformBinded =
		_isTransformInverseBinded = false;
    }

    this.setRot = function (p) {
        this.rot = [p[0], p[1], p[2]];
        _isTransformBinded = 
		_isTransformInverseBinded = false;
    }

    this.setScl = function (p) {
        this.scl = [p[0], p[1], p[2]];
        _isTransformBinded = 
		_isTransformInverseBinded = false;
    }

    this.setDir = function (p) {
        this.dir = [p[0], p[1], p[2]];
        _isTransformBinded = 
		_isTransformInverseBinded = false;
    }

    this.MoveInDir = function (v) {
        // TODO: Implement MoveInDir
    }

    this.BindToMatrix = function () {
		if( !_isTransformBinded ) {
			this.space.IdentitySet(); 
			
			this.space.Translate( this.loc );
			this.space.Scale( this.scl );
			this.space.Rotate( this.rot );
			_isTransformBinded = true;
		}
    }
	
	this.BindToMatrixInverse = function () {
		if( !_isTransformInverseBinded ) {
			this.space.IdentitySet(); 
			
			this.space.Translate( [ -this.loc[0], -this.loc[1], -this.loc[2] ] );
			this.space.Scale( [ this.scl[0], this.scl[1], this.scl[2] ] );
			this.space.Rotate(  [ -this.rot[0], -this.rot[1], -this.rot[2] ]  );
			
			_isTransformInverseBinded = true;
		}
	}

    this.MatrixGet = function () {
        if ( !_isTransformBinded )
            this.BindToMatrix();
        return this.space.MatrixGet();
    }
	
	this.MatrixInverseGet = function () {
		if ( !_isTransformInverseBinded )
            this.BindToMatrixInverse();
        return this.space.MatrixGet();	
	}
	
	this.TransformPoint = function( p ) {
		return Mat4x4.TransformPoint( p, m );
	}
	
	this.TransformPointInverse = function( p ) {
		return Mat4x4.TransformPoint( p, mInv );
	}
}

var Mat4x4 = {
    Identity: function () {
        return [ 1, 0, 0, 0,
				 0, 1, 0, 0,
				 0, 0, 1, 0,
				 0, 0, 0, 1 ];
    },

    Translate: function (v3) {
        return [ 1, 0, 0, v3[0],
				 0, 1, 0, v3[1],
				 0, 0, 1, v3[2],
			     0, 0, 0, 1 ];
    },

    Scale: function (v3) {
        return [ v3[0], 0, 0, 0,
				 0, v3[1], 0, 0,
				 0, 0, v3[2], 0,
				 0, 0, 0, 1 ];
    },

    Multiply: function (mA, mB) {
        return [ 
				mA[0]*mB[0] + mA[4]*mB[1] + mA[8]*mB[2] + mA[12]*mB[3], 
				mA[0]*mB[4] + mA[4]*mB[5] + mA[8]*mB[6] + mA[12]*mB[7],
				mA[0]*mB[8] + mA[4]*mB[9] + mA[8]*mB[10] + mA[12]*mB[11],
				mA[0]*mB[12] + mA[4]*mB[13] + mA[8]*mB[14] + mA[12]*mB[15],

				mA[1]*mB[0] + mA[5]*mB[1] + mA[9]*mB[2] + mA[13]*mB[3], 
				mA[1]*mB[4] + mA[5]*mB[5] + mA[9]*mB[6] + mA[13]*mB[7],
				mA[1]*mB[8] + mA[5]*mB[9] + mA[9]*mB[10] + mA[13]*mB[11],
				mA[1]*mB[12] + mA[5]*mB[13] + mA[9]*mB[14] + mA[13]*mB[15],
				
				mA[2]*mB[0] + mA[6]*mB[1] + mA[10]*mB[2] + mA[14]*mB[3], 
				mA[2]*mB[4] + mA[6]*mB[5] + mA[10]*mB[6] + mA[14]*mB[7],
				mA[2]*mB[8] + mA[6]*mB[9] + mA[10]*mB[10] + mA[14]*mB[11],
				mA[2]*mB[12] + mA[6]*mB[13] + mA[10]*mB[14] + mA[14]*mB[15],
				
				mA[3]*mB[0] + mA[7]*mB[1] + mA[11]*mB[2] + mA[15]*mB[3], 
				mA[3]*mB[4] + mA[7]*mB[5] + mA[11]*mB[6] + mA[15]*mB[7],
				mA[3]*mB[8] + mA[7]*mB[9] + mA[11]*mB[10] + mA[15]*mB[11],
				mA[3]*mB[12] + mA[7]*mB[13] + mA[11]*mB[14] + mA[15]*mB[15]
				];
    },

    RotateX: function (r) {
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return [ 1, 0, 0, 0,
				 0, cos, -sin, 0,
				 0, sin, cos, 0,
				 0, 0, 0, 1 ];
    },

    RotateY: function (r) {
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return [ cos, 0, -sin, 0,
				 0, 1, 0, 0,
				 sin, 0, cos, 0,
				 0, 0, 0, 1 ];
    },

    RotateZ: function (r) {
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return [ cos, -sin, 0, 0,
				 sin, cos, 0, 0,
				 0, 0, 1, 0,
				 0, 0, 0, 1 ];
    },

    Rotate: function (v3) {
        var m = Mat4x4.Identity();
        if (v3[1]) {
            var rotY = Mat4x4.RotateY(v3[1]);
            m = Mat4x4.Multiply(m, rotY)
        }
        if (v3[0]) {
            var rotX = Mat4x4.RotateX(v3[0]);
            m = Mat4x4.Multiply(m, rotX)
        }
        if (v3[2]) {
            var rotZ = Mat4x4.RotateZ(v3[2]);
            m = Mat4x4.Multiply(m, rotZ)
        }
        return m;
    },

    Inverse: function ( m ) {
		// TODO: Inverset Matrix implementation
		// m passed by ref
		
		/*
			a, b, c, d,
			e, f, g, h,
			i, j, k, l,
			m, n, o, p
		*/
	
		var det = m[0][0] * m[1][1] * m[2][2] + 
				  m[0][1] * m[1][2] * m[2][0] +
				  m[2][0] * m[1][0] * m[2][1] +
				  m[2][0] * m[1][1] * m[2][0] +
				  m[0][1] * m[1][0] * m[2][2] +
				  m[0][0] * m[1][2] * m[2][1]; 
		
		// 3x3 matrix inversion here
		var mOut = [m[1][1]*m[2][2] - m[1][2]*m[2][1],
					m[1][0]*m[2][2] - m[1][2]*m[2][0],
					m[1][0]*m[2][1] - m[1][2]*m[2][0],
					m[1][0]*m[2][2] - m[0][2]*m[1][2],
					m[0][0]*m[2][2] - m[2][0]*m[2][0],
					m[0][0]*m[0][1] - m[2][0]*m[2][0],
					m[0][1]*m[1][2] - m[0][2]*m[1][1],
					m[0][0]*m[1][2] - m[0][2]*m[1][0],
					m[0][0]*m[1][1] - m[0][1]*m[1][0]];
					
		// translation inversion
        mOut[0][3] = -m[0][3];
        mOut[1][3] = -m[1][3];
        mOut[2][3] = -m[2][3];
        mOut[3][3] = 1;
		
		return mOut; 
    },
	
	TransformPoint: function ( p, m ) {
		return [
				p[0] * m[0] + p[1] * m[4] + p[2] * m[8] + p[3] * m[12],
				p[0] * m[1] + p[1] * m[5] + p[2] * m[9] + p[3] * m[13],
				p[0] * m[2] + p[1] * m[6] + p[2] * m[10] + p[3] * m[14],
				p[0] * m[3] + p[1] * m[7] + p[2] * m[11] + p[3] * m[15] ];
    },
	
	Transpose: function ( mA ) {
		mOut = [];
		mOut[0] = mA[0];
		mOut[1] = mA[4];
		mOut[2] = mA[8];
		mOut[3] = mA[12];
		mOut[4] = mA[1];
		mOut[5] = mA[5];
		mOut[6] = mA[9];
		mOut[7] = mA[13];
		mOut[8] = mA[2];
		mOut[9] = mA[6];
		mOut[10] = mA[10];
		mOut[11] = mA[14];
		mOut[12] = mA[3];
		mOut[13] = mA[7];
		mOut[14] = mA[11];
		mOut[15] = mA[15];
		return mOut;
	}
}

Math._2PI = Math.PI * 2;

/*--Vector 2D-----------------------------------------------------------------*/
Math.Vector = function () { }
Math.Vector._2D = {
    Distance: function (A, B) {
        var dist = [A[0] - B[0], A[1] - B[1]];
        return Math.sqrt(dist[0] * dist[0] + dist[1] * dist[1]);
    },
    Magnitude: function (A) {
        return Math.sqrt(A[0] * A[0] + A[1] * A[1])
    },
    Difference: function (A, B) {
        return [A[0] - B[0], A[1] - B[1]];
    },
    Add: function (A, B) {
        return [A[0] + B[0], A[1] + B[1]];
    },
    CrossProduct3D: function (A, B) {
        return [0, 0, A[0] * B[1] - A[1] * B[0]];
    }
};

/*--Vector 3D-----------------------------------------------------------------*/
Math.Vector._3D = {
    Distance: function (A, B) {
        var dist = [A[0] - B[0], A[1] - B[1]];
        return Math.sqrt(dist[0] * dist[0] + dist[1] * dist[1] + dist[2] * dist[2]);
    },
    Magnitude: function (A) {
        return Math.sqrt(A[0] * A[0] + A[1] * A[1] + A[2] * A[2])
    },
    Difference: function (A, B) {
        return [A[0] - B[0], A[1] - B[1], A[2] - B[2]];
    },
    Add: function (A, B) {
        return [A[0] + B[0], A[1] + B[1] , A[2] + B[2]];
    },
    CrossProduct: function (A, B) {
        return [ A[1] * B[2] - A[2] * B[1],
				 A[2] * B[0] - A[0] * B[2],
				 A[0] * B[1] - A[1] * B[0]];
    },
    DotProduct: function (A, B) {
        return ( A[0] * B[0] + A[1] * B[1] + A[2] * B[2] );
    },
	Normal: function( A ) {
		var mag = Math.Vector._3D.Magnitude( A ); 
		return [ A[0] / mag, A[1] / mag, A[2] / mag ]; 
	}, 
	Scale: function( V, scalar ) {
		return [ V[0] * scalar, V[1] * scalar, V[2] * scalar ];
	}
};

Math.Vector._4D = {
	Magnitude: function (A) {
			return Math.sqrt( A[0] * A[0] + A[1] * A[1] + A[2] * A[2] + A[3] * A[3] );
		},
	Normal: function( A ) {
		var mag = Math.Vector._4D.Magnitude( A ); 
		return [ A[0] / mag, A[1] / mag, A[2] / mag, A[3] / mag ]; 
	}
}

/*--Interpolation-------------------------------------------------------------*/
Math.Interpolation = function () { }
Math.Interpolation.Linear = function (A, B, interp) {
    A += (B - A) * interp;
    return A;
}

/*--Geometry------------------------------------------------------------------*/
Math.Geometry = function () { }
Math.Geometry.TriangleArea2D = function (triVert) {
    return .5 * Math.Vector._3D.Magnitude( Math.Vector._2D.CrossProduct3D( Math.Vector._2D.Difference(triVert[1], triVert[0]),
																		   Math.Vector._2D.Difference(triVert[2], triVert[0]) 
																		 )
										 );
}

Math.Geometry.Plane3D = function() { return [ 0, 0, 0, 0 ]; }
Math.Geometry.Plane3D.FromPoints = function (triVert) {
	var vAB = Math.Vector._3D.Difference( triVert[1], triVert[0] ),
		vAC = Math.Vector._3D.Difference( triVert[2], triVert[0] );
	
	var plane3D = [];
	plane3D[0] = vAB[1] * vAC[2] - vAC[1] * vAB[2];
	plane3D[1] = vAB[2] * vAC[0] - vAC[2] * vAB[0];
	plane3D[2] = vAB[0] * vAC[1] - vAC[0] * vAB[1];
	
	var len = Math.Vector._3D.Magnitude( plane3D );
    
	plane3D[0] /= len;
    plane3D[1] /= len;
    plane3D[2] /= len; 
	
    plane3D[3] = -( plane3D[0] * triVert[0][0] +
					plane3D[1] * triVert[0][1] +
					plane3D[2] * triVert[0][2] );

    return plane3D;
}

Math.Geometry.Plane3D.FromVectorAndPoint = function( vec, point ) {
	var len = Math.Vector._3D.Magnitude( vec ); 
	var plane3D = [ vec[0] / len, vec[1] / len, vec[2] / len, 0 ]; 
	plane3D[3] = -( plane3D[0] * point[0] + 
					plane3D[1] * point[1] +
					plane3D[2] * point[2] ); 
	return plane3D; 
}

Math.Geometry.Plane3D.DistanceToPoint = function( plane, point ) {
	return  Math.Vector._3D.DotProduct( plane, point ) + plane[3];
}

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
