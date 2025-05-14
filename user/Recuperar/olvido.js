document.querySelectorAll('.input-codigo').forEach((input, idx, arr) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && idx < arr.length - 1) {
      arr[idx + 1].focus();
    }
  });
});
