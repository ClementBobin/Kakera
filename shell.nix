{ pkgs ? import <nixpkgs> {} }:

let
  libraries = with pkgs; [
    webkitgtk_4_1
    gtk3
    libayatana-appindicator
    librsvg
    gdk-pixbuf
    glib
    dbus
    openssl
    # Added for rendering stability
    pango
    harfbuzz
    cairo
  ];
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    pkg-config
    nodePackages.nodejs
    nodePackages.pnpm
    rustc
    cargo
    
    # UI Essentials
    gsettings-desktop-schemas
    adwaita-icon-theme
  ] ++ libraries;

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
    
    # Crucial: This allows GTK to find its schemas and icons
    export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-data-convert:${pkgs.gtk3}/share/gsettings-data-convert:${pkgs.adwaita-icon-theme}/share:$XDG_DATA_DIRS
    
    # Fix for some Nix environments where WebKit fails to init
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
    
    echo "Tauri environment ready. If no window appears, try: GDK_BACKEND=x11 pnpm tauri dev"
  '';
}