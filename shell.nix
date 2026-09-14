{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    git
    gh
    just
    jq
  ];

  shellHook = ''
    echo "⚡ Welcome to jsonresume-theme-signal development shell!"
  '';
}
