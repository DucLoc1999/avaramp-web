export interface Bank {
  id: number;
  bin_code: string;
  bank_name: string;
  short_name: string;
  image: string;
}

export const banks: Bank[] = [
  { id: 1, bin_code: "970436", bank_name: "Ngân hàng TMCP Ngoại Thương Việt Nam", short_name: "Vietcombank", image: "https://static.holdstation.com/pay/banks/img/VCB.png" },
  { id: 2, bin_code: "970406", bank_name: "Ngân hàng Số Vikki", short_name: "Vikki Bank", image: "https://static.holdstation.com/pay/banks/img/DAB.png" },
  { id: 3, bin_code: "970407", bank_name: "Ngân hàng TMCP Kỹ Thương Việt Nam", short_name: "Techcombank", image: "https://static.holdstation.com/pay/banks/img/TCB.png" },
  { id: 4, bin_code: "970422", bank_name: "Ngân hàng TMCP Quân Đội", short_name: "MBBank", image: "https://static.holdstation.com/pay/banks/img/MB.png" },
  { id: 5, bin_code: "970441", bank_name: "Ngân hàng TMCP Quốc tế", short_name: "VIB", image: "https://static.holdstation.com/pay/banks/img/VIB.png" },
  { id: 6, bin_code: "970415", bank_name: "Ngân hàng TMCP Công Thương Việt Nam", short_name: "VietinBank", image: "https://static.holdstation.com/pay/banks/img/ICB.png" },
  { id: 7, bin_code: "970431", bank_name: "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam", short_name: "Eximbank", image: "https://static.holdstation.com/pay/banks/img/EXB.png" },
  { id: 8, bin_code: "970416", bank_name: "Ngân hàng TMCP Á Châu", short_name: "ACB", image: "https://static.holdstation.com/pay/banks/img/ACB.png" },
  { id: 9, bin_code: "970437", bank_name: "Ngân hàng TMCP Phát Triển TP. Hồ Chí Minh", short_name: "HDBank", image: "https://static.holdstation.com/pay/banks/img/HDB.png" },
  { id: 10, bin_code: "970426", bank_name: "Ngân hàng TMCP Hàng Hải", short_name: "MSB", image: "https://static.holdstation.com/pay/banks/img/MSB.png" },
  { id: 11, bin_code: "970419", bank_name: "Ngân hàng TMCP Quốc Dân", short_name: "NCB", image: "https://static.holdstation.com/pay/banks/img/NCB.png" },
  { id: 12, bin_code: "970427", bank_name: "Ngân hàng TMCP Việt Á", short_name: "VietABank", image: "https://static.holdstation.com/pay/banks/img/VAB.png" },
  { id: 13, bin_code: "970432", bank_name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", short_name: "VPBank", image: "https://static.holdstation.com/pay/banks/img/VPB.png" },
  { id: 14, bin_code: "970403", bank_name: "Ngân hàng TMCP Sài Gòn Thương Tín", short_name: "Sacombank", image: "https://static.holdstation.com/pay/banks/img/STB.png" },
  { id: 15, bin_code: "970409", bank_name: "Ngân hàng TMCP Bắc Á", short_name: "BacABank", image: "https://static.holdstation.com/pay/banks/img/BAB.png" },
  { id: 16, bin_code: "970408", bank_name: "Ngân hàng TM TNHH MTV Dầu Khí Toàn Cầu", short_name: "GPBank", image: "https://static.holdstation.com/pay/banks/img/GPB.png" },
  { id: 17, bin_code: "970405", bank_name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", short_name: "Agribank", image: "https://static.holdstation.com/pay/banks/img/AGB.png" },
  { id: 18, bin_code: "970418", bank_name: "Ngân hàng Đầu tư và Phát triển Việt Nam", short_name: "BIDV", image: "https://static.holdstation.com/pay/banks/img/BIDV.png" },
  { id: 19, bin_code: "970414", bank_name: "Ngân hàng TNHH Một thành viên Việt Nam Hiện Đại", short_name: "MBV", image: "https://static.holdstation.com/pay/banks/img/OJB.png" },
  { id: 20, bin_code: "970430", bank_name: "Ngân Hàng TMCP Xăng Dầu Petrolimex", short_name: "PGBank", image: "https://static.holdstation.com/pay/banks/img/PGB.png" },
  { id: 21, bin_code: "970443", bank_name: "Ngân hàng TMCP Sài Gòn - Hà Nội", short_name: "SHB", image: "https://static.holdstation.com/pay/banks/img/SHB.png" },
  { id: 22, bin_code: "970423", bank_name: "Ngân hàng TMCP Tiên Phong", short_name: "TPBank", image: "https://static.holdstation.com/pay/banks/img/TPB.png" },
  { id: 23, bin_code: "970428", bank_name: "Ngân hàng TMCP Nam Á", short_name: "NamABank", image: "https://static.holdstation.com/pay/banks/img/NAB.png" },
  { id: 24, bin_code: "970400", bank_name: "Ngân hàng Sài Gòn Công Thương", short_name: "SaigonBank", image: "https://static.holdstation.com/pay/banks/img/SGB.png" },
  { id: 25, bin_code: "970425", bank_name: "Ngân hàng TMCP An Bình", short_name: "ABBank", image: "https://static.holdstation.com/pay/banks/img/ABB.png" },
  { id: 43, bin_code: "970410", bank_name: "Ngân hàng TNHH MTV Standard Chartered Bank Việt Nam", short_name: "Standard Chartered Viet Nam", image: "https://static.holdstation.com/pay/banks/img/SC.png" },
  { id: 44, bin_code: "970444", bank_name: "Ngân hàng TNHH MTV Xây dựng Việt Nam", short_name: "CBBank", image: "https://static.holdstation.com/pay/banks/img/CBB.png" },
  { id: 45, bin_code: "970446", bank_name: "Ngân hàng TMCP Hợp tác xã Việt Nam", short_name: "COOPBANK", image: "https://static.holdstation.com/pay/banks/img/COOPBANK.png" },
  { id: 46, bin_code: "546034", bank_name: "Ngân hàng số CAKE by VPBank", short_name: "CAKE", image: "https://static.holdstation.com/pay/banks/img/CAKE.png" },
  { id: 47, bin_code: "970419", bank_name: "Ngân hàng TMCP Quốc dân", short_name: "National Bank", image: "https://static.holdstation.com/pay/banks/img/NVB.png" },
  { id: 48, bin_code: "970462", bank_name: "Ngân hàng Kookmin Bank chi nhánh Hà Nội", short_name: "Kookmin Bank HN", image: "https://static.holdstation.com/pay/banks/img/KBHN.png" },
  { id: 49, bin_code: "546035", bank_name: "Ngân hàng số Ubank by VPBank", short_name: "Ubank", image: "https://static.holdstation.com/pay/banks/img/Ubank.png" },
  { id: 50, bin_code: "801011", bank_name: "Ngân hàng NongHyup chi nhánh Hà Nội", short_name: "NongHyup Bank", image: "https://static.holdstation.com/pay/banks/img/NHBHN.png" },
  { id: 51, bin_code: "668888", bank_name: "Ngân hàng Đại Chúng TNHH Kasikornbank", short_name: "KBank", image: "https://static.holdstation.com/pay/banks/img/Kbank.png" },
  { id: 52, bin_code: "963666", bank_name: "Ngân hàng BNP Paribas", short_name: "BNP Paribas", image: "https://static.holdstation.com/pay/banks/img/BNP.jpg" },
  { id: 53, bin_code: "422589", bank_name: "Ngân hàng CIMB Vietnam", short_name: "CIMB", image: "https://static.holdstation.com/pay/banks/img/CIMB.png" },
  { id: 54, bin_code: "796500", bank_name: "Ngân hàng TNHH MTV Phát triển Singapore", short_name: "DBS", image: "https://static.holdstation.com/pay/banks/img/DBS.png" },
  { id: 55, bin_code: "970463", bank_name: "Ngân hàng Kookmin - Chi nhánh HCM", short_name: "KBHCM", image: "https://static.holdstation.com/pay/banks/img/KBHCM.png" },
  { id: 56, bin_code: "970455", bank_name: "Ngân hàng Công Nghiệp Hàn Quốc CN Hà Nội", short_name: "IBK", image: "https://static.holdstation.com/pay/banks/img/IBK.png" },
  { id: 57, bin_code: "963388", bank_name: "Ngân hàng số TIMO - Bản Việt", short_name: "TIMO", image: "https://static.holdstation.com/pay/banks/img/TIMO.png" },
  { id: 58, bin_code: "963399", bank_name: "Ngân hàng số Umee - Kiên Long", short_name: "Umee by KienlongBank", image: "https://static.holdstation.com/pay/banks/img/UMEE.jpeg" },
  { id: 59, bin_code: "970456", bank_name: "Ngân hàng Công nghiệp Hàn Quốc CN HCM", short_name: "IBKHCM", image: "https://static.holdstation.com/pay/banks/img/IBKHCM.png" },
  { id: 60, bin_code: "533948", bank_name: "Ngân hàng Citibank Việt Nam", short_name: "Citibank", image: "https://static.holdstation.com/pay/banks/img/CTB.png" },
  { id: 61, bin_code: "977777", bank_name: "Công ty Tài chính TNHH MTV Mirae Asset Việt Nam", short_name: "MAFC", image: "https://static.holdstation.com/pay/banks/img/MAFC.jpg" },
  { id: 62, bin_code: "970467", bank_name: "Ngân hàng KEB Hana CN Hà Nội", short_name: "KEBHANAHN", image: "https://static.holdstation.com/pay/banks/img/KEBHANAHN.jpg" },
  { id: 63, bin_code: "970466", bank_name: "Ngân hàng KEB Hana CN Hồ Chí Minh", short_name: "KEBHANAHCM", image: "https://static.holdstation.com/pay/banks/img/KEBHANAHCM.jpg" },
  { id: 64, bin_code: "999888", bank_name: "Ngân hàng Chính sách Xã hội", short_name: "VNSPB", image: "https://static.holdstation.com/pay/banks/img/VNSPB.png" },
  { id: 65, bin_code: "963369", bank_name: "Ngân hàng số Liobank NH Phương đông", short_name: "LIOBANK", image: "https://static.holdstation.com/pay/banks/img/LIOBANK.png" },
  { id: 66, bin_code: "971011", bank_name: "VNPT Money", short_name: "VNPTMONEY", image: "https://static.holdstation.com/pay/banks/img/VNPTMONEY.png" },
  { id: 67, bin_code: "971005", bank_name: "Viettel Money", short_name: "VIETELMONEY", image: "https://static.holdstation.com/pay/banks/img/VIETELMONEY.png" },
];

const bankById = new Map<number, Bank>(banks.map((b) => [b.id, b]));

export function getBankById(id: number): Bank | undefined {
  return bankById.get(id);
}
