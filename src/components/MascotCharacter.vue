<template>
  <svg
    class="mascot"
    viewBox="0 0 260 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="130" cy="300" rx="70" ry="12" fill="#000" opacity="0.08" />

    <!-- legs -->
    <rect x="95" y="230" width="26" height="60" rx="13" fill="url(#body)" />
    <rect x="140" y="230" width="26" height="60" rx="13" fill="url(#body)" />

    <!-- arms -->
    <rect x="45" y="150" width="24" height="80" rx="12" fill="url(#body)" transform="rotate(-8 57 190)" />
    <rect x="192" y="150" width="24" height="80" rx="12" fill="url(#body)" transform="rotate(8 204 190)" />

    <!-- body -->
    <rect x="70" y="140" width="120" height="105" rx="52" fill="url(#body)" />

    <!-- head -->
    <rect x="55" y="15" width="150" height="140" rx="56" fill="url(#head)" />

    <!-- face -->
    <circle cx="108" cy="82" r="6.5" fill="#2b2b3d" />
    <circle cx="152" cy="82" r="6.5" fill="#2b2b3d" />
    <rect x="112" y="104" width="36" height="5" rx="2.5" fill="#2b2b3d" opacity="0.75" />

    <defs>
      <linearGradient id="head" x1="55" y1="15" x2="205" y2="155" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#f4f8ff" />
        <stop offset="1" stop-color="#c9d3f7" />
      </linearGradient>
      <linearGradient id="body" x1="70" y1="140" x2="190" y2="290" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#eef2fd" />
        <stop offset="1" stop-color="#bfc9f2" />
      </linearGradient>
    </defs>
  </svg>
</template>

<style scoped>
.mascot {
  width: 100%;
  max-width: 260px;
  height: auto;
  filter: drop-shadow(0 20px 30px rgba(30, 30, 80, 0.25));
}
</style>
