const KUORE = document.querySelector(".kuore-animation");
const TEAM_SPACE_INVADER = document.querySelectorAll("img[data-image-order]");


document.getElementById("appStart").addEventListener("click", () => {
    window.location = "groups.html";
});

document.getElementById("learnMore").addEventListener("click", () => {
    window.location = "https://techstationpadova.it/";
});

// KUORE.addEventListener("load", () => {
//     KUORE.setAttribute("style", "animation-name: kuore; animation-timing-function: ease-in-out; animation-duration: 2000ms; animation-iteration-count: infinite;");
//     setTimeout(() => {
//         KUORE.removeAttribute("style");
//     }, "2000ms");
// });

const animationList = {
    kuore: {
        run: false,
        active: false
    },
    teamSpaceInvader: {
        run: false,
        active: false
    },
    smallTeam1: {
        run: false,
        active: false
    },
    smallTeam2: {
        run: false,
        active: false
    },
    smallTeam3: {
        run: false,
        active: false
    },
    smallTeam4: {
        run: false,
        active: false
    },
    boxEmails: {
        run: false,
        active: false
    },
    boxMark: {
        run: false,
        active: false
    },
}


function animationEvent() {
    requestAnimationFrame(animationEvent)
    const totHeigth = window.scrollY + window.innerHeight;
    if (window.innerWidth > 960) {
        if (window.scrollY < 450) {
            // console.log("prima: "+animationList.kuore.active)
            if (animationList.kuore.run === false && animationList.kuore.active === false) {
                // console.log("condizione: "+(animationList.kuore.run === false && animationList.kuore.active === false))
                animationList.kuore.run = true;
                animationList.kuore.active = true;
                KUORE.setAttribute("style", "animation-name: kuore; animation-timing-function: ease-in-out; animation-duration: 3000ms; animation-iteration-count: 1;");
                // console.log("dopo: "+ animationList.kuore.active)
                setTimeout(() => {
                    // console.log("kuore")
                    KUORE.removeAttribute("style");
                    animationList.kuore.active = false;
                }, "2950");
            }
        }
        if (totHeigth >= 625) {
            if (window.scrollY >= 450) {
                animationList.kuore.run = false;
            }
            // if(window.scrollY >= )
            // if (animationList.teamSpaceInvader.run === false) {
            //     animationList.teamSpaceInvader.run = true;
            //     for (let i = 0; i < TEAM_SPACE_INVADER.length; i++) {
            //         TEAM_SPACE_INVADER[i].setAttribute("style", "animation-name: jump; animation-timing-function: ease-in-out; animation-duration: 750ms; animation-iteration-count: infinite;");
            //     }
            //     setTimeout(() => {
            //         for (let i = 0; TEAM_SPACE_INVADER.length; i++) {
            //             TEAM_SPACE_INVADER[i].removeAttribute("style");
            //         }
            //     }, "750");
                // const i = 0;
                // const INVADERS_ANIMATION = (x) => {
                //     let i=x;
                //     const run=(i) => {
                //         TEAM_SPACE_INVADER[i].setAttribute("style", "animation-name: jump; animation-timing-function: ease-in-out; animation-duration: 750ms; animation-iteration-count: infinite;");
                //         const stop=(i) => {
                //             TEAM_SPACE_INVADER[i].removeAttribute("style");
                //         }
                //         setTimeout(stop(i), "750");
                //     }
                //     setTimeout(run(i), "500");
                //     i++;
                //     if (i < 7) {
                //         INVADERS_ANIMATION(i);
                //     }
                // }
                // INVADERS_ANIMATION(i);
            // }
        }
        // if (totHeigth >= 625) {
        //     if (window.scrollY >= 950) {
        //         animationList.teamSpaceInvader.run = false;
        //     }
        // }
    }
}
setTimeout(animationEvent, "1000")