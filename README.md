# Deeplink hosting repository

This repository hosts the assetlinks of the flutter engagement app, allowing to securely deep link into it. Note that the fingerprints are linked to specific keystores.
If you want to add a fingerprint, please run the following in your android project containing the engagement App or in the /android directory of your flutter project:

```
./gradlew signingReport
```

and copy the generated SHA-256 fingerprint.

