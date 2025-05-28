@ECHO OFF

REM ===================================
REM =  Container Name and Tag Config  =
REM ===================================
SET REPO_NAME=luke/luke-portal
SET TAG=v1.0.11

REM ===================================
REM =       Azure Configuration       =
REM ===================================
SET ACR_NAME=cgacraksnonprd
SET USERNAME=4f2aeb05-706a-4956-84e0-6f65da252728
SET PASSWORD=sFy8Q~zWbKEI-IoQHCh-0HeKS2_ersSB4v_qkaLl
SET TENANT=central.co.th


IF EXIST "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" GOTO AZ_BUILD
IF EXIST "%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" GOTO DOCKER_BUILD

:AZ_BUILD
CALL "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" login --service-principal --username %USERNAME% --password %PASSWORD% --tenant %TENANT% || GOTO END
CALL "%PROGRAMFILES(X86)%\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" acr build --registry %ACR_NAME% --image %REPO_NAME%:%TAG% --file Dockerfile . || GOTO END
GOTO END

:DOCKER_BUILD
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" login %ACR_NAME%.azurecr.io --username %USERNAME% --password %PASSWORD% || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" build -f Dockerfile_NonProd -t %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% . || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" push %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% || GOTO END
"%PROGRAMFILES%\Docker\Docker\resources\bin\docker.exe" image rmi %ACR_NAME%.azurecr.io/%REPO_NAME%:%TAG% || GOTO END
GOTO END

:END