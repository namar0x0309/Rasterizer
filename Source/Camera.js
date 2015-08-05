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


