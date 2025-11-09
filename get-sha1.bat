@echo off
echo ====================================
echo Getting SHA-1 Fingerprints
echo ====================================
echo.

cd android

echo Debug SHA-1:
echo -----------
gradlew signingReport

echo.
echo ====================================
echo DONE! Look for "SHA1:" in the output above
echo Copy ALL SHA-1 fingerprints to Firebase Console
echo ====================================
pause
