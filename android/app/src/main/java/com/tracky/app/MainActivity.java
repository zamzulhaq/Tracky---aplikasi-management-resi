package com.tracky.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    private PermissionRequest pendingPermission;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // html5-qrcode memakai getUserMedia (RESOURCE_VIDEO_CAPTURE) di WebView.
        // Android WebView menolaknya kecuali host app memberi izin di sini.
        this.bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                boolean needsCamera = false;
                for (String r : request.getResources()) {
                    if (r.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                            || r.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        needsCamera = true;
                        break;
                    }
                }
                if (!needsCamera) {
                    super.onPermissionRequest(request);
                    return;
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        && MainActivity.this.checkSelfPermission(Manifest.permission.CAMERA)
                                != PackageManager.PERMISSION_GRANTED) {
                    pendingPermission = request;
                    MainActivity.this.requestPermissions(new String[] { Manifest.permission.CAMERA }, 1001);
                } else {
                    request.grant(request.getResources());
                }
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1001 && pendingPermission != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingPermission.grant(pendingPermission.getResources());
            } else {
                pendingPermission.deny();
            }
            pendingPermission = null;
        }
    }
}
