document.addEventListener('DOMContentLoaded', () => {

    // === obrót śmigła ===
    let angle = 0;
    function obracajSmigla() {
        angle += 2;
        const blad = document.querySelectorAll('#tloSmigla .blad');
        blad.forEach((el, index) => {
            const baseAngle = index * 72;
            el.style.transform = `translate(-50%, -100%) rotate(${baseAngle + angle}deg)`;
        });
        requestAnimationFrame(obracajSmigla);
    }
    requestAnimationFrame(obracajSmigla);

    // === animacja lewej łopaty ===
    const lopataLewa = document.getElementById('lopataLewa');
    let leftPercentLewa = 0;
    let directionLewa = 1;

    function animujLopateLewa() {
        leftPercentLewa += directionLewa * 1;
        if (leftPercentLewa >= 100) directionLewa = -1;
        if (leftPercentLewa <= 0) directionLewa = 1;

        lopataLewa.style.clipPath = `polygon(${leftPercentLewa}% 0%, 100% 0%, 100% 100%, ${leftPercentLewa}% 100%)`;

        requestAnimationFrame(animujLopateLewa);
    }
    requestAnimationFrame(animujLopateLewa);

    // === animacja prawej łopaty ===
    const lopataPrawa = document.getElementById('lopataPrawa');
    let rightPercent = 100;  // początkowy procent prawej krawędzi
    let directionPrawa = -1; // ruszamy w lewo

    function animujLopatePrawa() {
        rightPercent += directionPrawa * 1;
        if (rightPercent <= 0) directionPrawa = 1;
        if (rightPercent >= 100) directionPrawa = -1;

        // clip-path: prawa łopata „chowa się” w lewo
        lopataPrawa.style.clipPath = `polygon(0% 0%, ${rightPercent}% 0%, ${rightPercent}% 100%, 0% 100%)`;

        requestAnimationFrame(animujLopatePrawa);
    }
    requestAnimationFrame(animujLopatePrawa);
});
