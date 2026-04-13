{ pkgs ? import <nixpkgs> {} }:

let
  # This ensures we use the same OpenSSL version that the Node package was built with
  nodePkg = pkgs.nodejs_20; # Or pkgs.nodejs if you want the latest
  
  libraries = with pkgs; [
    webkitgtk_4_1
    gtk3
    libayatana-appindicator
    librsvg
    gdk-pixbuf
    glib
    dbus
    openssl # Standard openssl
  ];
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    # Tools
    pkg-config
    curl
    wget
    
    # Development
    nodePkg
    nodePackages.pnpm
    rustc
    cargo
    
    # System Libraries
    webkitgtk_4_1
    gtk3
    libayatana-appindicator
    librsvg
  ] ++ libraries;

  shellHook = ''
    # Add the libraries to the linker path
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
    
    # Tauri/GTK specific environment variables
    export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-data-convert:${pkgs.gtk3}/share/gsettings-data-convert:$XDG_DATA_DIRS
    
    echo "Environment updated. Node version: $(node -v)"
  '';
}