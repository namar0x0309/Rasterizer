::AUTHOR: Nassim Amar
::PROJECT: Module.Rasterizer

rem @echo off

::VARIABLE SETUP
set arg=%1
set SOURCEDIR=%~dp0Source
set ASSETDIR=%~dp0Assets
set OUTPUTSRC=Module.Rasterizer.js
set OUTPUTASSETS=Rasterizer.Assets.js
set COMPILER="%~dp0Tools\closurecompiler\compiler.jar"

::COMPILING
if /i "%1" == "debug" (goto :Debug) else (goto :Release)

::DEBUG BUILD
:Debug
copy /b %SOURCEDIR%\*.js %OUTPUTSRC%.TEMP
copy /b %ASSETDIR%\*.js %OUTPUTASSETS%.TEMP
goto :Final

::RELEASE BUILD
:Release
java -jar %COMPILER% ^
        --compilation_level=WHITESPACE_ONLY ^
        --js=%OUTPUTSRC%.TEMP ^
        --js_output_file=%OUTPUTSRC%.TEMP

java -jar %COMPILER% ^
         --js=%OUTPUTASSETS%.TEMP ^
         --js_output_file=%OUTPUTASSETS%.TEMP
goto :Final

:Final
::Appending Licenses
type LICENSE > %OUTPUTSRC%
type %OUTPUTSRC%.TEMP >> %OUTPUTSRC%
del %OUTPUTSRC%.TEMP

type LICENSE > %OUTPUTASSETS%
type %OUTPUTASSETS%.TEMP >> %OUTPUTASSETS%
del %OUTPUTASSETS%.TEMP