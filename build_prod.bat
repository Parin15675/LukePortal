@ECHO OFF

REM ===================================
REM =  Container Name and Tag Config  =
REM ===================================
SET REPO_NAME=luke/luke-portal
SET TAG=v1.0.0

REM ===================================
REM =       Azure Configuration       =
REM ===================================
SET ACR_NAME=cgacraksprd
SET USERNAME=4f224600-2f16-4c34-920e-46ef9af63164
SET PASSWORD=hza8Q~Q1opUS4ROQtxtXUClLgem4PnF5zlTYfbbe
SET TENANT=central.co.th


IF EXIST "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" GOTO AZ_BUILD
IF EXIST "%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" GOTO DOCKER_BUILD

:AZ_BUILD
CALL "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" login --service-principal --username %USERNAME% --password %PASSWORD% --tenant %TENANT% || GOTO END
CALL "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" acr build --registry %ACR_NAME% --image %REPO_NAME%:%TAG% --file Dockerfile . || GOTO END
GOTO END

:DOCKER_BUILD
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" login %ACR_NAME%.azurecr.io --username %USERNAME% --password %PASSWORD% || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" build -f Dockerfile_Prod -t %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% . || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" push %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" image rmi %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% || GOTO END
GOTO END

:END