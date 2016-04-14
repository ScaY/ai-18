/*
 * Ceci est une ardoise JavaScript.
 *
 * Saisissez du code JavaScript, puis faites un clic droit ou sélectionnez à partir du menu Exécuter :
 * 1. Exécuter pour évaluer le texte sélectionné (Ctrl+R),
 * 2. Examiner pour mettre en place un objet Inspector sur le résultat (Ctrl+I), ou,
 * 3. Afficher pour insérer le résultat dans un commentaire après la sélection. (Ctrl+L)
 */

 function entropyB(probability) {
            var entropy = 0;
     
     if(probability != 1 ){
         
         entropy += (1.0 - probability) * Math.log2(1.0 - probability);
     }

            if (probability != 0) {
                entropy += (probability * Math.log2(probability));
            }

            entropy = -entropy;
            console.log("EntropyB for " + probability + " = " + entropy);
            return entropy;
 }


var a = 1 - ( (2/12)*entropyB(0) + (4/12)*entropyB(1) + (6/12)*entropyB(2/6) );
console.log(a);
