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
    # Networking/TLS essentials
    glib-networking 
  ];
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    pkg-config
    nodePackages.nodejs
    nodePackages.pnpm
    rustc
    cargo
    gsettings-desktop-schemas
    adwaita-icon-theme
  ] ++ libraries;

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
    
    # --- THIS PART FIXES THE TLS ERROR ---
    export GIO_EXTRA_MODULES=${pkgs.glib-networking}/lib/gio/modules
    export GSETTINGS_SCHEMA_DIR=${pkgs.gsettings-desktop-schemas}/share/gsettings-data-convert
    # --------------------------------------

    export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-data-convert:${pkgs.gtk3}/share/gsettings-data-convert:${pkgs.adwaita-icon-theme}/share:$XDG_DATA_DIRS
    
    # Optional: ensure webkit uses the right settings
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
    
    echo "Tauri environment ready with TLS support."
  '';
}