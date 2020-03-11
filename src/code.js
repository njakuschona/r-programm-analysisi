const code = ["","# Example script to run INSYDE using the default settings",'#install.packages("truncnorm")',"library(truncnorm)","","","test <- function(x, y){","        return(x+y)","        }","","xxxxxxxxxxxxxxxxxxxxxxxx = 8","x= 4","y= 3","","","","x = test(x,y)","# setwd(\".\")","","# Load INSYDE main function","# INSYDE: a synthetic, probabilistic flood damage model based on explicit cost analysis","","ComputeDamage <- function(he, v, d, s, q, FA, IA, BA, EP, IH, BH, GL, NF, BT, BS, PD, PT, FL, YY, LM, repVal, up, uncert, nrSim = NA) {","","  # Calculate the water depth at the ground level","  he <- pmin(he, NF * IH * 1.05)","  nf <- rep(NF, length(he))","  h <- round((he - GL), 3)","  h <- (h > 0) * h","","  # Calculate other exposure variables","  IP <- 2.5 * EP       # Internal perimeter (m)","  BP <- 4 * sqrt(BA)   # Basement perimeter (m)","  BL <- GL - 0.3 - BH  # Basement level (m)","","  # Calculate replacement values (new and used)","  RVN <- repVal * FA * NF  ","  age <- 2015 - YY","  decay <- min(0.01 * age / LM, 0.3)","  RVU <- RVN * (1 - decay)","","  # Fragility functions","  # ===================","  # All components: 12 - 36 h","  frag1 <- round(ptruncnorm(d, a = 12, b = 36, mean = 24, sd = 24/6), 3)","  # Wood floor:  0.2 - 0.6 m","  frag2_1f <- round(ptruncnorm(h, a = 0.2, b = 0.6, mean = 0.4, sd = .4/6), 3)","  frag2_2f <- round(ptruncnorm(h, a = 0.2 + IH, b = 0.6 + IH, mean = 0.4 + IH, sd = .4/6), 3)","  # Partitions: 1.5 - 2.0 m","  frag3_1f <- round(ptruncnorm(h, a = 1.5, b = 2.0, mean = 1.75, sd = .5/6), 3)","  frag3_2f <- round(ptruncnorm(h, a = 1.5 + IH, b = 2.0 + IH, mean = 1.75 + IH, sd = .5/6), 3)","  # External plaster and doors: 1.0 - 1.5 m/s","  frag4 <- round(ptruncnorm(v, a = 1, b = 1.5, mean = 1.25, sd = .5/6), 3)","  # Doors: 0.4 - 0.8 m","  frag5_1f <- round(ptruncnorm(h, a = 0.4, b = 0.8, mean = 0.6, sd = .4/6), 3)","  frag5_2f <- round(ptruncnorm(h, a = 0.4 + IH, b = 0.8 + IH, mean = 0.6 + IH, sd = .4/6), 3)","  # Windows: 1.2 - 1.8 m","  frag6_1f <- round(ptruncnorm(h, a = 1.2, b = 1.8, mean = 1.5, sd = .5/6), 3)","  frag6_2f <- round(ptruncnorm(h, a = 1.2 + IH, b = 1.8 + IH, mean = 1.5 + IH, sd = 0.5/6), 3)","  # Windows: 0.8 - 1.0 m/s","  frag7 <- round(ptruncnorm(v, a = 0.8, b = 1, mean = 0.9, sd = .2/6), 3)","  # Structural damage","  frag8 <- round(pnorm((he * v), mean = 5, sd = 4/6), 3) * (v >= 2)","","  # Computation of the damage ratios","  # ================================","  if (uncert == 0) {","    dr1 <- frag1","    dr2 <- frag2_1f + frag2_2f","    dr3 <- frag3_1f + frag3_2f","    dr4 <- frag4","    dr5 <- frag5_1f + frag5_2f","    dr6 <- frag6_1f + frag6_2f","    dr7 <- frag7","    dr8 <- frag8","  } else {","    dr1 <- sample(c(0, 1), nrSim, T, c(1 - frag1, frag1))","    dr2_1f <- sample(c(0, 1), nrSim, T, c(1 - frag2_1f, frag2_1f))","    dr2_2f <- sample(c(0, 1), nrSim, T, c(1 - frag2_2f, frag2_2f))","    dr2 <- dr2_1f + dr2_2f","    dr3_1f <- sample(c(0, 1), nrSim, T, c(1 - frag3_1f, frag3_1f))","    dr3_2f <- sample(c(0, 1), nrSim, T, c(1 - frag3_2f, frag3_2f))","    dr3 <- dr3_1f + dr3_2f","    dr4 <- sample(c(0, 1), nrSim, T, c(1 - frag4, frag4))","    dr5_1f <- sample(c(0, 1), nrSim, T, c(1 - frag5_1f, frag5_1f))","    dr5_2f <- sample(c(0, 1), nrSim, T, c(1 - frag5_2f, frag5_2f))","    dr5 <- dr5_1f + dr5_2f","    dr6_1f <- sample(c(0, 1), nrSim, T, c(1 - frag6_1f, frag6_1f))","    dr6_2f <- sample(c(0, 1), nrSim, T, c(1 - frag6_2f, frag6_2f))","    dr6 <- dr6_1f + dr6_2f","    dr7 <- sample(c(0, 1), nrSim, T, c(1 - frag7, frag7))","    dr8 <- sample(c(0, 1), nrSim, T, c(1 - frag8, frag8))","  }  ","  ","  # Damage components:","  # 1 C Cleanup","  # 2 R Removal","  # 3 N Non-strucural","  # 4 S Structural","  # 5 F Finishing","  # 6 W Windows & Doors","  # 7 P Building systems","","  # 1. Cleanup","  # ==========","  # Pumping (?/m3)","  C1 <- up[\"pumping\",] * (he>=0) * (                       # unit price","          IA * (max(-GL, 0)) +                             # volume remaining in first storey after the event, if GL < 0","          BA * (-BL - min(0.3, (GL>0 & GL<0.3)*(0.3-GL)))  # volume remaining in basement after the event (h_slab = 0.30)","          ) * (1 - 0.2*(BT==3))                            # economies of scale ","","  # Waste diposal (?/m3)","  C2 <- up[\"disposal\",] *           # unit price","          s * (1 + (q==1)*0.4) * (  # sediment concentration (s); presence of pollutants (q)","          IA * h +                  # volume in storeys above ground during the event","          BA * BH                   # volume in basement during the event","          ) * (1 - 0.2*(BT==3))     # economies of scale","","  # Cleaning (?/m2)","  C3 <- up[\"cleaning\",] *                        # unit price","          (1 + (q==1)*0.4) * (                   # presence of pollutants (q)","          IA * pmin(nf, ceiling(h/IH)) + IP*h +  # affected area in storeys above ground","          BA + BP*BH                             # affected area in basement","          ) * (1 - 0.2*(BT==3))                  # economies of scale","","  # Dehumidification (?/m3)","  C4 <- up[\"dehumidification\",] * dr1 * (               # unit price; duration damage ratio","          IA * IH * pmin(nf, ceiling(h/IH)) * (he>0) +  # volume in storeys above ground","          BA * BH                                       # basement volume","          ) * (1 - 0.2*(BT==3))                         # economies of scale","","  # 2. Removal","  # ==========","  # Screed removal","  R1 <- up[\"screedremoval\",] * IA * (   # unit price * internal area","          (FL>1) * dr1 * pmin(nf, dr2)  # if pavement is wood, remove it","          ) * (1 - 0.2*(BT==3))         # economies of scale","","  # Pavement removal","  R2 <- up[\"parquetremoval\",] * (FL>1) *  # if pavement is wood, remove it","          dr1 * pmin(nf, dr2) *","          IA * (1 - 0.2*(BT==3))          # internal area and economies of scale","","  # Baseboard removal","  R3 <- up[\"baseboardremoval\",] *                      # unit price","          dr1 * pmin(nf, ceiling((h-0.05)/IH)) * IP *","          (1 - 0.2*(BT==3))                            # economies of scale","","  # Partitions removal","  R4 <- up[\"partitionsremoval\",] * dr1 *  # unit price; duration damage ratio","          (1+(BS==1)*0.20) * 0.5 * IP *   # perimeter","          IH * pmin(nf, dr3) *            # height","          (1 - 0.2*(BT==3))               # economies of scale","","  # Plasterboard removal","  R5 <- up[\"plasterboardremoval\",] *                               # unit price","          IA * 0.2 * pmin(nf, ceiling((h-(IH-.5))/IH)) * (FL>1) *","          (1 - 0.2*(BT==3))                                        # economies of scale","","  # External plaster removal","  R6 <- up[\"extplasterremoval\",] *       # unit price","          pmax(q==1, LM<=1, dr1, dr4) *  # damage ratios","          EP * (he+1.0) *                # area to replace","          (1 - 0.2*(BT==3))              # economies of scale","","  # Internal plaster removal","  R7 <- up[\"intplasterremoval\",] *  # unit price","          pmax(q==1, LM<=1, dr1) *  # damage ratios","          (IP*(h+1.0) + BP*BH) *    # area to replace","          (1 - 0.2*(BT==3))         # economies of scale","","  # Doors removal","  R8 <- up[\"doorsremoval\",] *        # unit price","          pmax(dr4, dr1) * (         # damage ratios","          pmin(nf, dr5) * 0.12*IA +  # door area in storeys above ground","          0.03*BA ) *                # door area in basement","          (1 - 0.2*(BT==3))          # economies of scale","","  # Windows removal","  R9 <- up[\"windowsremoval\",] *      # unit price","          pmax(dr7, dr1) *           # damage ratios","          pmin(nf, dr6) * 0.12*IA *  # window area","          (1 - 0.2*(BT==3))          # economies of scale","","  # Boiler removal","  R10 <- up[\"boilerremoval\",] * IA * (               # unit price; internal area","          (PD==1) * ((BA>0) + (BA==0)*(h>1.6)) +     # if heating system is not distributed","          (PD==2) * (pmin(nf, ceiling((h-1.6)/IH)))  # if heating system is distributed","          ) * (1 - 0.2*(BT==3))                      # economies of scale","","  # 3. Non-Structural","  # =================","  # Partitions replacement","  N1 <- up[\"partitionsreplace\",] * dr1 *  # unit price; duration damage ratio","          (1+(BS==1)*0.20) * 0.5 * IP *   # perimeter","          IH * pmin(nf, dr3) *            # height","          (1 - 0.2*(BT==3))               # economies of scale","","  # Screed replacement","  N2 <- up[\"screedreplace\",] * IA * (   # unit price; internal area","          (FL>1) * dr1 * pmin(nf, dr2)  # if pavement is wood, remove it because it is damaged","          ) * (1 - 0.2*(BT==3))         # economies of scale","","  # Plasterboard replacement","  N3 <- up[\"plasterboardreplace\",] *                               # unit price","          IA * 0.2 * pmin(nf, ceiling((h-(IH-.5))/IH)) * (FL>1) * ","          (1 - 0.2*(BT==3))                                        # economies of scale","","  # 4. Structural","  # =============","  S1 <- up[\"soilconsolidation\",] * dr8 *","          FA * NF * IH * (0.01 + (BS==1)*0.01) *","          (1 - 0.2*(BT==3))","","  S2 <- up[\"localrepair\",] * (BS==2) * dr8 *","          EP * 0.5 * he * (1+s) *","          (1 - 0.2*(BT==3))","","  S3 <- up[\"pillarretrofitting\",] * (BS==1) * dr8 * ","          0.15 * EP * he *","          (1 - 0.2*(BT==3))","","  # 5. Finishing","  # ============","  # External plaster replacement","  F1 <- up[\"extplasterreplace\",] * FL *  # unit price (affected by finishing level)","          pmax(q==1, LM<=1, dr1, dr4) *  # damage ratios","          EP * (he+1.0) *                # area to replace","          (1 - 0.2*(BT==3))              # economies of scale","","  # Internal plaster replacement","  F2 <- up[\"intplasterreplace\",] * FL *  # unit price (affected by finishing level)",
"          pmax(q==1, LM<=1, dr1) *       # damage ratios","          (IP*(h+1.0) + BP*BH) *         # area to replace","          (1 - 0.2*(BT==3))              # economies of scale","","  # Painting","  # --------","  F3 <- up[\"extpainting\",] * pmin(nf, ceiling(he/IH))*IH*EP * FL * (1-0.2*(BT==3))","  F4 <- up[\"intpainting\",] * (pmin(nf, ceiling(h/IH))*IH*IP + BP*BH*(FL>1 & BT==1)) * FL * (1-0.2*(BT==3))","","  # Pavement replacement ","  F5 <- up[\"parquetreplace\",] * (FL>1) *  # if pavement is wood, remove it because it is damaged","          dr1 * pmin(nf, dr2) *","          IA * (1 - 0.2*(BT==3))          # internal area and economies of scale","","  # Baseboard replacement","  F6 <- up[\"baseboardreplace\",] * dr1 *          # unit price; duration damage ratio","          pmin(nf, ceiling((h-0.05)/IH)) * IP *","          (1 - 0.2*(BT==3))                      # economies of scale","","  # 6. Windows and doors","  # ====================","  # Doors replacement","  W1 <- up[\"doorsreplace\",] *        # unit price","          pmax(dr4, dr1) * (         # damage ratios","          pmin(nf, dr5) * 0.12*IA +  # door area in storeys above ground","          0.03*BA ) *                # door area in basement","          (1 + (FL>1)) *             # finishing level","          (1 - 0.2*(BT==3))          # economies of scale","","  # Windows replacement","  W2 <- up[\"windowsreplace\",] *      # unit price","          pmax(dr7, dr1) *           # damage ratios","          pmin(nf, dr6) * 0.12*IA *  # window area","          (1 + (FL>1)) *             # finishing level","          (1 - 0.2*(BT==3))          # economies of scale","","  # 7. Building systems","  # ===================","  # Boiler replacement","  P1 <- up[\"boilerreplace\",] * IA * (                    # unit price; internal area","          (PD==1) * ((BA>0) + (BA==0)*(h>1.6)) +         # if heating system is not distributed","          (PD==2) * (pmin(nf, ceiling((h-1.6)/IH))) ) *  # if heating system is distributed","          (1 + 0.25 * xor(BT==1, BT==2))                 # over-dimensioning coefficient","","  # Radiator painting","  P2 <- up[\"radiatorpaint\",] * (PT==1) * pmin(nf, ceiling((h-0.2)/IH)) * IA/20 * (1-0.2*(BT==3))","","  # Underfloor heating replacement","  P3 <- up[\"underfloorheatingreplace\",] * IA *  # unit price; internal area","          (PT==2) * (                           # is heating system type is underfloor heating","          (FL>1) * dr1 * pmin(nf, dr2)          # if pavement is wood","          ) * (1 - 0.2*(BT==3))                 # economies of scale","","  # Electrical system replacement","  P4 <- up[\"electricalsystreplace\",] * IA * (      # unit price; internal area","          pmin(nf, ceiling((h-0.2)/IH)) * 0.4 +    # 0 - 0.20 m","          pmin(nf, ceiling((h-1.1)/IH)) * 0.3 +    # 0.20 - 1.10 m","          pmin(nf, ceiling((h-1.5)/IH)) * 0.3 ) *  # 1.10 - 1.50 m","          (1 + (FL>1)) *                           # finishing level - sophistication of electrical system","          (1 - 0.2*(BT==3))                        # economies of scale","","  # Plumbing system replacement","  P5 <- up[\"plumbingsystreplace\",] * IA *          # unit price; internal area","          (s>0.10 | q==1) * (                      # conditions for damage to occur","          pmin(nf, ceiling((h-0.15)/IH)) * 0.1 +   # 0 - 0.15 m","          pmin(nf, ceiling((h-0.4)/IH)) * 0.2 +    # 0.15 - 0.40 m","          pmin(nf, ceiling((h-0.9)/IH)) * 0.2 ) *  # 0.40 - 0.90 m","          (1 + (FL>1)) *                           # finishing level - sophistication of plumbing system","          (1 - 0.2*(BT==3))                        # economies of scale","","  dmgCleanUp \t     <- C1 + C2 + C3","  dmgRemoval \t     <- R1 + R2 + R3 + R4 + R5 + R6 + R7 + R8 + R9 + R10 ","  dmgNonStructural <- N1 + N2 + N3","  dmgStructural    <- S1 + S2 + S3 ","  dmgFinishing     <- F1 + F2 + F3 + F4 + F5 + W1 + W2","  dmgSystems       <- P1 + P2 + P3 + P4 + P5 ","","  absDamage <- dmgCleanUp + dmgRemoval + dmgNonStructural + dmgStructural + dmgFinishing + dmgSystems","  relDamage <- absDamage / RVN","  groupDamage <- cbind(dmgCleanUp, dmgRemoval, dmgNonStructural, dmgStructural, dmgFinishing, dmgSystems)","  componentDamage <- cbind(C1, C2, C3, ","    R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, ","    N1, N2, N3, ","    S1, S2, S3, ","    F1, F2, F3, F4, F5, W1, W2, ","    P1, P2, P3, P4, P5)","","  return(list(\"absDamage\" = absDamage, \"relDamage\" = relDamage, \"groupDamage\" = groupDamage, \"componentDamage\" = componentDamage))","}","","","# Hazard variables","","he <- seq(0, 5, 0.01)  # water depth (m)","velocity <- 0.5   # velocity (m/s)","sediment <- 0.05  # sediment concentration (-)","duration <- 24    # flood duration (h)","q <- 1     # water quality (presence of pollutants) 1=yes 0=no","","","# Exposure variables","","# Geometry","FA <- 100       # Footprint area (m2)","IA <- 0.9 * FA  # Internal area (m2)","BA <- 0.5 * FA  # Basement area (m2)","EP <- 40        # External Perimeter (m)","IH <- 3.5       # Interstorey height (m)","BH <- 3.2       # Basement height (m)","GL <- 0.1       # Ground floor level (m)","NF <- 2         # Number of floors","","# Others","BT <- 1     # Building type: 1- Detached, 2- Semi-detached, 3- Apartment house ","BS <- 2     # Building structure: 1- Reinforced concrete, 2- Masonry, 3- Wood","PD <- 1     # Plant distribution: 1- Centralized, 2- Distributed","PT <- 1\t    # Heating system type: 1- Radiator, 2- Underfloor heating","FL <- 1.2   # Finishing level coefficient: High 1.2, Medium 1, Low 0.8","YY <- 1994  # Year of construction","LM <- 1.1   # Level of maintanance coefficient: High 1.1, Medium 1, Low 0.9","","","# Read unit prices","up <- read.table(\"unit_prices.txt\")","","# Read replacement values","repValData <- read.table(\"replacement_values.txt\", header = TRUE)","repVal <- repValData[BS, BT]","","# Define whether or not to consider uncertainty","uncert <- 0","","if (!uncert) {","  # Compute expected damage. Note that (only) one of the hazard variables can ","  # be passed to the function as a vector.","  modelOutput <- ComputeDamage(he, velocity, duration, sediment, q, ","                  FA, IA, BA, EP, IH, BH, GL, NF, BT, BS, PD, PT, FL, YY, LM, ","                  repVal, up, uncert)","} ","else if (uncert) {","  # Probabilistic computation. All the hazard variables must be passed to the","  # function as scalars.","  # This example assumes that the variable he is a vector. It is therefore","  # necessary to iterate over its elements and pass them to the function one","  # at a time.","  nrSim <- 2000","  statMat <- matrix(NA, nrow = length(he), ncol = 4)","  for (i in 1:length(he)) {","    modelOutput <- ComputeDamage(he[i], velocity, duration, sediment, q, ","                    FA, IA, BA, EP, IH, BH, GL, NF, BT, BS, PD, PT, FL, YY, LM,","                    repVal, up, uncert, nrSim)","    # For each element of he, calculate some summary statistics and save them","    # to a matrix.","    statMat[i, 1] <- quantile(modelOutput$absDamage, .05)","    statMat[i, 2] <- mean(modelOutput$absDamage)","    statMat[i, 3] <- quantile(modelOutput$absDamage, .95)","    statMat[i, 4] <- mean(modelOutput$relDamage)","  }","}","","par(mar = c(5, 4.2, 4, 4.5))","","plotFigure1 = function(he,modelOutput){","","  plot(he, modelOutput$absDamage, type = \"l\", lwd = 2, ylim = c(0, max(modelOutput$absDamage) * 1.12), xlab = \"Water depth (m)\", ylab = \"Damage (€)\", main = \"Building damage\", panel.first = grid(NULL))","  ","  lines(he, modelOutput$groupDamage[, \"dmgCleanUp\"], lwd = 2, col = \"green4\")","  lines(he, modelOutput$groupDamage[, \"dmgRemoval\"], lwd = 2, col = \"blue4\")","  lines(he, modelOutput$groupDamage[, \"dmgNonStructural\"], lwd = 2, col = \"darkorange\")","  lines(he, modelOutput$groupDamage[, \"dmgStructural\"], lwd = 2, col = \"firebrick1\")","  lines(he, modelOutput$groupDamage[, \"dmgFinishing\"], lwd = 2, col = \"gold2\")","  lines(he, modelOutput$groupDamage[, \"dmgSystems\"], lwd = 2, col = \"green1\")","  ","  par(new = TRUE)","  plot(he, modelOutput$relDamage, type = \"l\", lwd = 2, axes = FALSE, ylim = c(0, max(modelOutput$relDamage) * 1.12), xlab = NA, ylab = NA)","  axis(side = 4)","  mtext(side = 4, line = 3, \"Relative damage\")","  legend(\"topleft\", bg = \"white\", c(\"damage total\",\"cleanup\",\"removal\",\"non structural\",\"structural\",\"finishing+WD\",\"systems\"), fill = c(\"black\",\"green4\",\"blue4\",\"darkorange\",\"firebrick1\",\"gold2\",\"green1\"))","}","","plotFigure1(he,modelOutput)"]

export default code;