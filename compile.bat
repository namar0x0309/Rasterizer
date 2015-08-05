::AUTHOR: Nassim Amar
::PROJECT: Module.Rasterizer

@echo off

::VARIABLE SETUP
set arg=%1
set SOURCEDIR=Source
set ASSETDIR=Assets

::COMPILING
if /i "%1" == "debug" (goto :Debug) else (goto :Release)

::DEBUG BUILD
:Debug
type %SOURCEDIR%\Header.js > Module.Rasterizer.temp.js
type %SOURCEDIR%\Types.js >> Module.Rasterizer.temp.js
type %SOURCEDIR%\Math.js >> Module.Rasterizer.temp.js
type %SOURCEDIR%\Mesh.js >> Module.Rasterizer.temp.js
type %SOURCEDIR%\Camera.js >> Module.Rasterizer.temp.js
type %SOURCEDIR%\ContextCanvas.js >> Module.Rasterizer.temp.js

type %ASSETDIR%\Cube.js >> Rasterizer.Assets.temp.js
type %ASSETDIR%\namar0x0309.js >> Rasterizer.Assets.temp.js
type %ASSETDIR%\Suzanne.js >> Rasterizer.Assets.temp.js
type %ASSETDIR%\Apple.js >> Rasterizer.Assets.temp.js
goto :Final

::RELEASE BUILD
:Release
java -jar "..\Tools\closurecompiler\compiler.jar" --compilation_level=WHITESPACE_ONLY --js=%SOURCEDIR%\Header.js --js=%SOURCEDIR%\Types.js --js=%SOURCEDIR%\Math.js --js=%SOURCEDIR%\Mesh.js --js=%SOURCEDIR%\Camera.js  --js=%SOURCEDIR%\ContextCanvas.js --js_output_file=Module.Rasterizer.temp.js

java -jar "..\Tools\closurecompiler\compiler.jar" --js=%ASSETDIR%\Cube.js --js=%ASSETDIR%\namar0x0309.js --js=%ASSETDIR%\Suzanne.js --js=%ASSETDIR%\Apple.js --js_output_file=Rasterizer.Assets.temp.js
goto :Final

:Final
::Appending Licenses
type LICENSE > Module.Rasterizer.js
type Module.Rasterizer.temp.js >> Module.Rasterizer.js
del Module.Rasterizer.temp.js

type LICENSE > Rasterizer.Assets.js
type Rasterizer.Assets.temp.js >> Rasterizer.Assets.js
del Rasterizer.Assets.temp.js